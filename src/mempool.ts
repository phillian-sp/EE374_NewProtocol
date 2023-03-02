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
    } catch (e: any) {
      throw new AnnotatedError(
        "INVALID_TX_OUTPOINT",
        "Transaction cannot be added to the mempool due to an already spent transaction input."
      );
    }
  }

  getTxidArray() {
    console.log("Getting mempool");
    console.log(this.mempool);
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
