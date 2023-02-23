import {
  BlockObject,
  BlockObjectType,
  TransactionObject,
  ObjectType,
  AnnotatedError,
} from "./message";
import { hash } from "./crypto/hash";
import { canonicalize } from "json-canonicalize";
import { Peer } from "./peer";
import { objectManager, ObjectId, db } from "./object";
import util from "util";
import { UTXOSet } from "./utxo";
import { logger } from "./logger";
import { Transaction } from "./transaction";
import { chaintipManager } from "./chaintipmanager";

const TARGET =
  "00000000abc00000000000000000000000000000000000000000000000000000";
const GENESIS: BlockObjectType = {
  T: TARGET,
  created: 1671062400,
  miner: "Marabu",
  nonce: "000000000000000000000000000000000000000000000000000000021bea03ed",
  note: "The New York Times 2022-12-13: Scientists Achieve Nuclear Fusion Breakthrough With Blast of 192 Lasers",
  previd: null,
  txids: [],
  type: "block",
};
const BU = 10 ** 12;
const BLOCK_REWARD = 50 * BU;

export class Block {
  previd: string | null;
  txids: ObjectId[];
  nonce: string;
  T: string;
  created: number;
  miner: string | undefined;
  note: string | undefined;
  studentids: string[] | undefined;
  blockid: string;
  fees: number | undefined;
  height: number | undefined;

  public static async fromNetworkObject(
    object: BlockObjectType
  ): Promise<Block> {
    return new Block(
      object.previd,
      object.txids,
      object.nonce,
      object.T,
      object.created,
      object.miner,
      object.note,
      object.studentids
    );
  }
  constructor(
    previd: string | null,
    txids: string[],
    nonce: string,
    T: string,
    created: number,
    miner: string | undefined,
    note: string | undefined,
    studentids: string[] | undefined
  ) {
    this.previd = previd;
    this.txids = txids;
    this.nonce = nonce;
    this.T = T;
    this.created = created;
    this.miner = miner;
    this.note = note;
    this.studentids = studentids;
    this.blockid = hash(canonicalize(this.toNetworkObject()));
  }
  // static getGenesisBlock(): Block {
  //   const genesis = new Block(GENESIS.previd, GENESIS.txids, GENESIS.nonce, GENESIS.T, GENESIS.created, GENESIS.miner, GENESIS.note, undefined)
  //   return genesis
  // }
  // static async add_genesis_block() {
  //   const block = Block.getGenesisBlock()
  //   await objectManager.put(block.toNetworkObject())
  //   await db.put(`blockutxo:${block.blockid}`, [])
  // }
  async loadStateAfter(): Promise<UTXOSet | undefined> {
    try {
      return new UTXOSet(
        new Set<string>(await db.get(`blockutxo:${this.blockid}`))
      );
    } catch (e) {
      return;
    }
  }
  async getCoinbase(): Promise<Transaction> {
    if (this.txids.length === 0) {
      throw new Error("The block has no coinbase transaction");
    }
    const txid = this.txids[0];
    logger.debug(`Checking whether ${txid} is the coinbase`);
    const obj = await objectManager.get(txid);

    if (!TransactionObject.guard(obj)) {
      throw new Error("The block contains non-transaction txids");
    }

    const tx: Transaction = Transaction.fromNetworkObject(obj);

    if (tx.isCoinbase()) {
      return tx;
    }
    throw new Error("The block has no coinbase transaction");
  }
  toNetworkObject() {
    const netObj: BlockObjectType = {
      type: "block",
      previd: this.previd,
      txids: this.txids,
      nonce: this.nonce,
      T: this.T,
      created: this.created,
      miner: this.miner,
    };

    if (this.note !== undefined) {
      netObj.note = this.note;
    }
    if (this.studentids !== undefined) {
      netObj.studentids = this.studentids;
    }
    return netObj;
  }
  hasPoW(): boolean {
    return BigInt(`0x${this.blockid}`) <= BigInt(`0x${TARGET}`);
  }
  isGenesis(): boolean {
    return this.previd === null;
  }

  /**
   * Get the height of the block. If the height is already known, it is returned
   * immediately. Otherwise, the parent block is retrieved and the height of the
   * parent block is retrieved recursively. If the parent block is the genesis
   * block, the height of the block is 0. Otherwise, the height of the block is
   * the height of the parent block plus 1.
   *
   * @param peer the peer from which to retrieve the block
   * @returns the height of the block
   */
  async getHeight(peer?: Peer): Promise<number> {
    if (this.height !== undefined) {
      return this.height;
    }
    // if height is undefined, we need to have peer as an argument
    if (peer === undefined) {
      throw new AnnotatedError(
        "INTERNAL_ERROR",
        "Block height is undefined, but no peer was provided to retrieve it from"
      );
    }
    let parentBlock = await this.validateAncestry(peer);
    // if the block has no parent, it is the genesis block
    if (parentBlock === null) {
      this.height = 0;
    } else {
      this.height = (await parentBlock.getHeight()) + 1;
    }
    return this.height;
  }
  /**
   * Get the transactions of the block.
   *
   * @param peer the peer from which to retrieve the transactions
   * @returns the transactions of the block
   */
  async getTxs(peer?: Peer): Promise<Transaction[]> {
    const txPromises: Promise<ObjectType>[] = [];
    let maybeTransactions: ObjectType[] = [];
    const txs: Transaction[] = [];

    // push all transaction retrieval promises to an array
    for (const txid of this.txids) {
      if (peer === undefined) {
        txPromises.push(objectManager.get(txid));
      } else {
        txPromises.push(objectManager.retrieve(txid, peer));
      }
    }

    // wait for all transactions to be retrieved
    // if one fails, reject the block
    try {
      maybeTransactions = await Promise.all(txPromises);
    } catch (e) {
      throw new AnnotatedError(
        "UNFINDABLE_OBJECT",
        `Retrieval of transactions of block ${this.blockid} failed; rejecting block`
      );
    }
    logger.debug(
      `We have all ${this.txids.length} transactions of block ${this.blockid}`
    );

    // check that all retrieved objects are transactions
    for (const maybeTx of maybeTransactions) {
      if (!TransactionObject.guard(maybeTx)) {
        throw new AnnotatedError(
          "UNFINDABLE_OBJECT",
          `Block reports a transaction with id ${objectManager.id(
            maybeTx
          )}, but this is not a transaction.`
        );
      }
      const tx = Transaction.fromNetworkObject(maybeTx);
      txs.push(tx);
    }

    return txs;
  }

  /**
   * Validate the block's transactions and calculate the UTXO state after the block.
   *
   * @param peer the peer from which to retrieve the transactions
   * @param stateBefore the UTXO state before the block
   * @returns the UTXO state after the block
   * @throws AnnotatedError if the block is invalid
   */
  async validateTx(peer: Peer, stateBefore: UTXOSet) {
    logger.debug(
      `Validating ${this.txids.length} transactions of block ${this.blockid}`
    );

    const stateAfter = stateBefore.copy();

    // wait for all transactions to be retrieved
    const txs = await this.getTxs(peer);

    for (let idx = 0; idx < txs.length; idx++) {
      await txs[idx].validate(idx, this);
    }

    await stateAfter.applyMultiple(txs, this);
    logger.debug(`UTXO state of block ${this.blockid} calculated`);

    let fees = 0;
    for (const tx of txs) {
      if (tx.fees === undefined) {
        throw new AnnotatedError(
          "INTERNAL_ERROR",
          `Transaction fees not calculated`
        );
      }
      fees += tx.fees;
    }
    this.fees = fees;

    let coinbase;

    try {
      coinbase = await this.getCoinbase();
    } catch (e) {}

    if (coinbase !== undefined) {
      // check that the coinbase transaction respects macroeconomic policy
      if (coinbase.outputs[0].value > BLOCK_REWARD + fees) {
        throw new AnnotatedError(
          "INVALID_BLOCK_COINBASE",
          `Coinbase transaction does not respect macroeconomic policy. ` +
            `Coinbase output was ${coinbase.outputs[0].value}, while reward is ${BLOCK_REWARD} and fees were ${fees}.`
        );
      }

      // determine its height and check that its height field matches the height of the block
      if (coinbase.height != (await this.getHeight(peer))) {
        throw new AnnotatedError(
          "INVALID_BLOCK_COINBASE",
          `Coinbase transaction ${coinbase.txid} has height ${
            coinbase.height
          }, but block ${this.blockid} has height ${this.getHeight()}`
        );
      }
    }

    await db.put(`blockutxo:${this.blockid}`, Array.from(stateAfter.outpoints));
    logger.debug(
      `UTXO state of block ${this.blockid} cached: ${JSON.stringify(
        Array.from(stateAfter.outpoints)
      )}`
    );
  }

  /**
   * Validates the block's ancestry, i.e. whether the parent block is valid and can be found.
   *
   * @param peer The peer from which to retrieve the parent block
   * @returns The parent block, if it is valid and can be found
   * @throws AnnotatedError if the parent block is not valid or cannot be found
   */
  async validateAncestry(peer: Peer): Promise<Block | null> {
    if (this.previd === null) {
      // genesis
      return null;
    }

    let parentBlock: Block;
    try {
      logger.debug(
        `Retrieving parent block of ${this.blockid} (${this.previd})`
      );
      // throws an error if the parent block is not found within the timeout
      const parentObject = await objectManager.retrieve(this.previd, peer);

      if (!BlockObject.guard(parentObject)) {
        throw new AnnotatedError(
          "UNFINDABLE_OBJECT",
          `Got parent of block ${this.blockid}, but it was not of BlockObject type; rejecting block.`
        );
      }
      parentBlock = await Block.fromNetworkObject(parentObject);
      await parentBlock.validate(peer);
    } catch (e: any) {
      throw new AnnotatedError(
        "UNFINDABLE_OBJECT",
        `Retrieval of block parent for block ${this.blockid} failed; rejecting block: ${e.message}`
      );
    }
    return parentBlock;
  }
  async validate(peer: Peer) {
    logger.debug(`Validating block ${this.blockid}`);

    try {
      if (this.T !== TARGET) {
        throw new AnnotatedError(
          "INVALID_FORMAT",
          `Block ${this.blockid} does not specify the fixed target ${TARGET}, but uses target ${this.T} instead.`
        );
      }
      logger.debug(`Block target for ${this.blockid} is valid`);

      if (!this.hasPoW()) {
        throw new AnnotatedError(
          "INVALID_BLOCK_POW",
          `Block ${this.blockid} does not satisfy the proof-of-work equation; rejecting block.`
        );
      }
      logger.debug(`Block proof-of-work for ${this.blockid} is valid`);

      let parentBlock: Block | null = null;
      let stateBefore: UTXOSet | undefined;

      // validate ancestor blocks
      if (this.isGenesis()) {
        if (!util.isDeepStrictEqual(this.toNetworkObject(), GENESIS)) {
          throw new AnnotatedError(
            "INVALID_FORMAT",
            `Invalid genesis block ${this.blockid}: ${JSON.stringify(
              this.toNetworkObject()
            )}`
          );
        }
        logger.debug(`Block ${this.blockid} is genesis block`);
        // genesis state
        stateBefore = new UTXOSet(new Set<string>());
        logger.debug(`State before block ${this.blockid} is the genesis state`);
      } else {
        // validate parent blocks
        parentBlock = await this.validateAncestry(peer);

        if (parentBlock === null) {
          throw new AnnotatedError(
            "UNFINDABLE_OBJECT",
            `Parent block of block ${this.blockid} was null`
          );
        }

        // this block's starting state is the previous block's ending state
        stateBefore = await parentBlock.loadStateAfter();
        logger.debug(`Loaded state before block ${this.blockid}`);
      }
      logger.debug(`Block ${this.blockid} has valid ancestry`);

      if (stateBefore === undefined) {
        throw new AnnotatedError(
          "UNFINDABLE_OBJECT",
          `We have not calculated the state of the parent block,` +
            `so we cannot calculate the state of the current block with blockid = ${this.blockid}`
        );
      }
      // Check that the timestamp of each block (the created field) is later than that of its parent,
      // and earlier than the current time.
      if (parentBlock !== null && this.created <= parentBlock.created) {
        throw new AnnotatedError(
          "INVALID_BLOCK_TIMESTAMP",
          `Block ${this.blockid} has timestamp ${this.created}, ` +
            `which is not later than the timestamp of its parent ${parentBlock.blockid} (${parentBlock.created})`
        );
      }
      // get current time
      const second = Math.floor(Date.now() / 1000);
      if (this.created > second) {
        throw new AnnotatedError(
          "INVALID_BLOCK_TIMESTAMP",
          `Block ${this.blockid} has timestamp ${this.created}, ` +
            `which is later than the current time ${second}`
        );
      }

      logger.debug(`State before block ${this.blockid} is ${stateBefore}`);

      await this.validateTx(peer, stateBefore);
      logger.debug(`Block ${this.blockid} has valid transactions`);

      if ((await this.getHeight(peer)) > chaintipManager.height) {
        // logger.debug(
        //   `Block ${this.blockid} is the longest chain with height ${this.height}`
        // );

        chaintipManager.setLongestTip(await this.getHeight(peer), this.blockid);
      }
    } catch (e: any) {
      throw e;
    }
  }
}

export const GENESIS_BLOCK = new Block(GENESIS.previd, GENESIS.txids, GENESIS.nonce, GENESIS.T, GENESIS.created, GENESIS.miner, GENESIS.note, undefined)