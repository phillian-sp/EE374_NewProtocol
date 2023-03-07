import { mempool } from "./mempool";
import { Block, TARGET } from "./block";
import { chainManager } from "./chain";
import { AnnotatedError } from "./message";
import { logger } from "./logger";
import { objectManager } from "./object";
import { peerManager } from "./peermanager";
import { network } from "./network";
const studentids = ["pmiao", "emily49"];

class Miner {
  async mine() {
    console.log("mining...");
    while (true) {
      const block = this.getNewBlock();
      if (block) {
        const minedBlock = this.mineBlock(block);
        await minedBlock.validate(network.peers[0]);
        await objectManager.put(minedBlock.toNetworkObject());
        network.broadcast({
          type: "ihaveobject",
          objectid: minedBlock.blockid,
        });
        logger.info(
          `Succesfully mined, validated, and broadcasted block with blockid ${minedBlock.blockid}.`
        );
        logger.info(`Full block is: ${minedBlock.toNetworkObject()}`);
      }
    }
  }
  getNewBlock() {
    let txids = mempool.getTxIds();
    if (chainManager.longestChainTip == null) {
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
