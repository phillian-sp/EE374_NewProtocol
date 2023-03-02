import { AnnotatedError, TransactionObjectType } from "./message";
import { ObjectId } from "./object";
import { UTXOSet } from "./utxo";
import { Transaction } from "./transaction";
import { Block } from "./block";
import { logger } from "./logger";

class MempoolManager {
  //   mempool: ObjectId[] = [];
  mempool: Transaction[] = [];
  mempoolState: UTXOSet = new UTXOSet(new Set<string>());

  async addTx(tx: Transaction) {
    try {
      await this.mempoolState.apply(tx);
      this.mempool.push(tx);
      logger.info(
        `Transaction ${tx.txid} added to the mempool. New mempool state is ${this.mempoolState} and mempool is ${this.mempool}`
      );
      // log all the transactions in the mempool and their state
      console.log("Mempool state is: ", this.mempoolState);
      // loop through the mempool and log each transaction
      for (const tx of this.mempool) {
        console.log("Mempool transaction is: ", tx);
      }
    } catch (e: any) {
      logger.warn(
        `Transaction ${tx.txid} could not be added to the mempool due to an already spent transaction input. The error was: ${e.message}`
      );
      throw new AnnotatedError(
        "INVALID_TX_OUTPOINT",
        `Transaction ${tx.txid} cannot be added to the mempool due to an already spent transaction input. The error was: ${e.message}`
      );
    }
  }

  getTxidArray() {
    return this.mempool.map((tx: Transaction) => tx.txid);
  }

  async reorg(block: Block) {
    if (block.stateAfter) {
      this.mempoolState = block.stateAfter;
      const oldMempool = this.mempool;
      this.mempool = [];
      for (const tx of oldMempool) {
        try {
          await this.addTx(tx);
        } catch (e) {}
      }
    }

    logger.info(
      `Mempool has been reorged, new mempool state is ${this.mempoolState} and mempool is ${this.mempool}`
    );
  }
}

export const mempoolManager = new MempoolManager();
