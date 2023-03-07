import { mempool } from "./mempool";
import { Block, TARGET } from "./block";
import { chainManager } from "./chain";
import { AnnotatedError } from "./message";
import { logger } from "./logger";
import { objectManager } from "./object";
import { peerManager } from "./peermanager";
import { network } from "./network";
import { Peer } from "./peer";
import { MessageSocket } from "./network";
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");

const studentids = ["pmiao", "emily49"];

class Miner {
  init(myPort: number, myIP: string) {
    logger.debug(`Initialized miner`);
    const myAddr = `${myIP}:${myPort}`;
    logger.info(`Attempting connection to known peer ${myAddr}`);
    try {
      const peer = new Peer(MessageSocket.createClient(myAddr), myAddr);
      // this.mine(peer);
    } catch (e: any) {
      logger.warn(`Failed to create connection to peer ${myAddr}: ${e.message}`);
    }
  }

  async mine() {
    logger.info("mining...");
    while (true) {
      const block = this.getNewBlock();
      if (block) {
        try {
          const minedBlock = this.mineBlock(block);
          // await minedBlock.validate(network.peers[0]);

          // await objectManager.put(minedBlock.toNetworkObject());
          // ownPeer.sendObject(minedBlock.toNetworkObject());

          network.broadcast({
            type: "ihaveobject",
            objectid: minedBlock.blockid,
          });
          network.broadcast({ type: "object", object: minedBlock.toNetworkObject() });
          logger.info(
            `Succesfully mined, validated, and broadcasted block with blockid ${minedBlock.blockid}.`
          );
          logger.info(`Full block is: ${minedBlock.toNetworkObject()}`);
        } catch (e) {}
      }
    }
  }
  getNewBlock() {
    // let txids = [];
    let txids = mempool.getTxIds();
    if (chainManager.longestChainTip === null) {
      logger.info(`Miner -- No chain exists to mine on.`);
      return null;
    } else {
      let previd = chainManager.longestChainTip?.blockid;
      return new Block(
        previd ? previd : null,
        txids,
        "",
        TARGET,
        Math.floor(new Date().getTime() / 1000),
        undefined,
        undefined,
        studentids
      );
    }
  }

  mineBlock(block: Block) {
    let nonce = 0;
    do {
      logger.debug(`Miner -- Trying nonce of ${nonce}`);
      block.nonce = String(nonce);
      nonce++;
    } while (!block.hasPoW());
    return block;
  }
}

export const miner = new Miner();
