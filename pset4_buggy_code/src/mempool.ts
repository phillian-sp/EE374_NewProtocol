import { Block } from './block'
import { logger } from './logger'
import { AnnotatedError } from './message'
import { Outpoint, Transaction } from './transaction'
import { UTXOSet } from './utxo'

export class Mempool {
    txs: Transaction[] = []
    txids: Set<string> = new Set<string>()
    utxo: UTXOSet = new UTXOSet(new Set<string>())
    
    constructor(txs: Transaction[]) {
        this.txs = txs
        this.utxo.applyMultiple(txs)
        for (const tx of txs) {
            this.txids.add(tx.txid)
        }
    }
    
    copy() {
        return new Mempool(this.txs)
    }
    
    async apply(tx: Transaction, idx?: number, block?: Block) {
        logger.debug(`Applying transaction ${tx.txid} to Mempool`)
        logger.debug(`Transaction ${tx.txid} has fees ${tx.fees}`)

        logger.debug(`Checking transaction ${tx.txid} against the current UTXO of Mempool.`)
        
        await this.utxo.apply(tx, idx, block)
        logger.debug(`Transaction ${tx.txid} is valid with respect to the current UTXO of Mempool.`)
        this.txs.push(tx)
        this.txids.add(tx.txid)
    }
    
    async applyMultiple(txs: Transaction[], block?: Block) {
        let idx = 0
    
        for (const tx of txs) {
            logger.debug(`Applying transaction ${tx.txid} to mempool`)
            await this.apply(tx, idx, block)
            idx += 1
        }
    }
    
    async remove(tx: Transaction) {
        logger.debug(`Removing transaction ${tx.txid} from mempool`)
        this.txs = this.txs.filter((t) => t.txid !== tx.txid)
        this.txids.delete(tx.txid)
    }
    
    async removeMultiple(txs: Transaction[]) {
        for (const tx of txs) {
            logger.debug(`Removing transaction ${tx.txid} from mempool`)
            await this.remove(tx)
        }
    }
    
    async getTx(txid: string) {
        logger.debug(`Getting transaction ${txid} from mempool`)
        for (const tx of this.txs) {
            if (tx.txid === txid) {
                return tx
            }
        }
        return undefined
    }
    
    async getTxs() {
        logger.debug(`Getting all transactions from mempool`)
        return this.txs
    }
    
    async getTxids() {
        logger.debug(`Getting all transaction ids from mempool`)
        return Array.from(this.txids)
    }
    
    async getFees() {
        logger.debug(`Getting all fees from mempool`)
        let fees = 0
    }
}
