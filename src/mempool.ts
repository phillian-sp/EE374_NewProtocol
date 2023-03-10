import { Block } from "./block";
import { Chain, chainManager } from "./chain";
import { logger } from "./logger";
import { AnnotatedError } from "./message";
import { db, ObjectId, objectManager } from "./object";
import { Transaction } from "./transaction";
import { UTXOSet } from "./utxo";
import { Worker, workerData } from "worker_threads";
import { getBlockTemplate, current_hight } from "./miner/mining";
import { network } from "./network";

class MemPool {
  txs: Transaction[] = [];
  state: UTXOSet | undefined;
  worker: Worker | undefined;

  async init() {
    await this.load();
    await this.save();
    logger.debug("Mempool initialized");
    await this.createNewWorker();
  }
  getTxIds(): ObjectId[] {
    const txids = this.txs.map((tx) => tx.txid);

    logger.debug(`Mempool txids: ${txids}`);

    return txids;
  }
  async fromTxIds(txids: ObjectId[]) {
    this.txs = [];

    for (const txid of txids) {
      this.txs.push(Transaction.fromNetworkObject(await objectManager.get(txid)));
    }
  }
  async save() {
    if (this.state === undefined) {
      throw new AnnotatedError(
        "INTERNAL_ERROR",
        "Could not save undefined state of mempool to cache."
      );
    }
    await db.put("mempool:txids", this.getTxIds());
    await db.put("mempool:state", Array.from(this.state.outpoints));
  }
  async load() {
    try {
      const txids = await db.get("mempool:txids");
      logger.debug(`Retrieved cached mempool: ${txids}.`);
      this.fromTxIds(txids);
    } catch {
      // start with an empty mempool of no transactions
    }
    try {
      logger.debug(`Loading mempool state from cache`);
      const outpoints = await db.get("mempool:state");
      logger.debug(`Outpoints loaded from cache: ${outpoints}`);
      this.state = new UTXOSet(new Set<string>(outpoints));
    } catch {
      // start with an empty state
      this.state = new UTXOSet(new Set());
    }
  }

  async createNewWorker() {
    if (this.worker) {
      // terminate the old worker
      logger.warn("Unsuccessful attempt to mine a block. Creating a new worker.\n--------------------------------------\n");
      
      this.worker.terminate();
    }
    this.worker = new Worker(__dirname + "/miner/worker.js", {
      workerData: await getBlockTemplate(), //template
      resourceLimits: {
        maxOldGenerationSizeMb: 4096,
        maxYoungGenerationSizeMb: 4096,
        codeRangeSizeMb: 4096,
      },
    });
    this.worker.on("message", async function (msg) {
      // logger.debug(`Mempool worker received message: ${msg}`);
      // if message starts with "message: " then it is a message from the worker
      if (msg.startsWith("message: ")) {
        logger.info(`Mempool worker message: ${msg}`);
        return;
      }
      logger.debug(`Mempool worker found block: ${msg}`);

      await objectManager.put(JSON.parse(msg));
      let block = await Block.fromNetworkObject(JSON.parse(msg));
      block.valid = true;
      block.height = current_hight;

      // calculate state after block
      // get parent block
      const parentBlockString = await objectManager.get(block.previd?.toString() || "");
      logger.info(`parent block string: ${parentBlockString}`);
      const parentBlock = await Block.fromNetworkObject(parentBlockString);
      await parentBlock.load();
      const stateBefore = parentBlock.stateAfter;
      logger.info(`state before: ${stateBefore?.toString()}`);
      // get transactions
      const txs = await block.getTxs();
      // apply transactions
      const stateAfter = stateBefore?.copy();
      
      await stateAfter?.applyMultiple(txs);
      block.stateAfter = stateAfter;
      // save block
      block.save();

      await chainManager.onValidBlockArrival(block);
      logger.debug(`the json parsed block is: ${JSON.parse(msg)}`);
      network.broadcast({
        type: "ihaveobject",
        objectid: objectManager.id(JSON.parse(msg)),
      });
    });
  }

  async onTransactionArrival(tx: Transaction): Promise<boolean> {
    try {
      await this.state?.apply(tx);
    } catch (e: any) {
      // failed to apply transaction to mempool, ignore it
      logger.debug(`Failed to add transaction ${tx.txid} to mempool: ${e.message}.`);
      return false;
    }
    logger.debug(`Added transaction ${tx.txid} to mempool`);
    this.txs.push(tx);
    await this.save();
    await this.createNewWorker();
    return true;
  }
  async reorg(lca: Block, shortFork: Chain, longFork: Chain) {
    logger.info("Reorganizing mempool due to longer chain adoption.");

    const oldMempoolTxs: Transaction[] = this.txs;
    let orphanedTxs: Transaction[] = [];

    for (const block of shortFork.blocks) {
      orphanedTxs = orphanedTxs.concat(await block.getTxs());
    }
    logger.info(`Old mempool had ${oldMempoolTxs.length} transaction(s): ${oldMempoolTxs}`);
    logger.info(
      `${orphanedTxs.length} transaction(s) in ${shortFork.blocks.length} block(s) were orphaned: ${orphanedTxs}`
    );
    orphanedTxs = orphanedTxs.concat(oldMempoolTxs);

    this.txs = [];

    const tip = longFork.blocks[longFork.blocks.length - 1];
    if (tip.stateAfter === undefined) {
      throw new Error(
        `Attempted a mempool reorg with tip ${tip.blockid} for which no state has been calculted.`
      );
    }
    this.state = tip.stateAfter;

    let successes = 0;
    for (const tx of orphanedTxs) {
      const success = await this.onTransactionArrival(tx);

      if (success) {
        ++successes;
      }
    }
    logger.info(`Re-applied ${successes} transaction(s) to mempool.`);
    logger.info(`${successes - orphanedTxs.length} transactions were abandoned.`);
    logger.info(`Mempool reorg completed.`);
  }
}

export const mempool = new MemPool();
