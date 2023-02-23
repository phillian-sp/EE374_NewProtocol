export type ObjectId = string

import level from 'level-ts'
import { canonicalize } from 'json-canonicalize'
import { ObjectTxOrBlock, ObjectType,
         TransactionObjectType, BlockObjectType, AnnotatedError } from './message'
import { Transaction } from './transaction'
import { Block } from './block'
import { logger } from './logger'
import { hash } from './crypto/hash'
import { Peer } from './peer'
import { Deferred, delay, resolveToReject } from './promise'

export const db = new level('./db')
const OBJECT_AVAILABILITY_TIMEOUT = 5000 // ms

class ObjectManager {
  // map from objectid to a list of deferred objects that are waiting for this object
  // to be available
  deferredObjects: { [key: string]: Deferred<ObjectType>[] } = {}

  id(obj: any) {
    return hash(canonicalize(obj))
  }
  async exists(objectid: ObjectId) {
    return await db.exists(`object:${objectid}`)
  }
  async get(objectid: ObjectId) {
    try {
      return await db.get(`object:${objectid}`)
    } catch {
      throw new AnnotatedError('UNKNOWN_OBJECT', `Object ${objectid} not known locally`)
    }
  }
  async del(objectid: ObjectId) {
    try {
      return await db.del(`object:${objectid}`)
    } catch {
      throw new AnnotatedError('UNKNOWN_OBJECT', `Object ${objectid} not known locally`)
    }
  }
  async put(object: any) {
    const objectid = this.id(object)

    logger.debug(`Storing object with id ${objectid}: %o`, object)
    // resolve any promises waiting for this object
    if (objectid in this.deferredObjects) {
      for (const deferred of this.deferredObjects[objectid]) {
        deferred.resolve(object)
      }
      delete this.deferredObjects[objectid]
    }
    // store object in database
    return await db.put(`object:${this.id(object)}`, object)
  }
  async validate(object: ObjectType, peer: Peer) {
    return await ObjectTxOrBlock.match<Promise<Block | Transaction>>(
      async (obj: TransactionObjectType) => {
        const tx: Transaction = Transaction.fromNetworkObject(obj)
        logger.debug(`Validating transaction: ${tx.txid}`)
        await tx.validate()
        return tx
      },
      async (obj: BlockObjectType) => {
        const block = await Block.fromNetworkObject(obj)
        logger.debug(`Validating block: ${block.blockid}`)
        await block.validate(peer)
        return block
      }
    )(object)
  }
  /**
   * Retrieve an object from the database or from a peer
   * 
   * @param objectid the id of the object to retrieve
   * @param peer     the peer to request the object from if it is not in the database
   * @returns        the object
   */
  async retrieve(objectid: ObjectId, peer: Peer): Promise<ObjectType> {
    logger.debug(`Retrieving object ${objectid}`)
    let object: ObjectType
    const deferred = new Deferred<ObjectType>()

    if (!(objectid in this.deferredObjects)) {
      this.deferredObjects[objectid] = []
    }
    // add this promise to the list of promises waiting for this object
    this.deferredObjects[objectid].push(deferred)

    try {
      object = await this.get(objectid)
      logger.debug(`Object ${objectid} was already in database`)
      return object
    }
    catch (e) {}

    logger.debug(`Object ${objectid} not in database. Requesting it from peer ${peer.peerAddr}.`)
    await peer.sendGetObject(objectid)

    object = await Promise.race([
      resolveToReject(
        delay(OBJECT_AVAILABILITY_TIMEOUT),
        `Timeout of ${OBJECT_AVAILABILITY_TIMEOUT}ms in retrieving object ${objectid} exceeded`
      ),
      deferred.promise
    ])

    logger.debug(`Object ${objectid} was retrieved from peer ${peer.peerAddr}.`)

    return object
  }
  constructor() {
    // add genesis block to database
    Block.add_genesis_block()
  }
}

export const objectManager = new ObjectManager()
