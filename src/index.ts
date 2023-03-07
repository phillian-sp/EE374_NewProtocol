import { logger } from "./logger";
import { network } from "./network";
import { chainManager } from "./chain";
import { mempool } from "./mempool";
import { AnnotatedError } from "./message";
import { miner } from "./miner/mining";
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
// const { Worker, isMainThread, parentPort, workerData } = require("node:worker_threads");
import { Block } from "./block";
import { TARGET } from "./block";
export const BIND_PORT = 18018;
export const BIND_IP = "0.0.0.0";
const studentids = ["pmiao", "emily49"];

logger.info(`Malibu - A Marabu node`);
logger.info(`Dionysis Zindros <dionyziz@stanford.edu>`);

async function main() {
  await chainManager.init();
  await mempool.init();
  network.init(BIND_PORT, BIND_IP);
  const worker = new Worker(__dirname + "/miner/mining.js", {});
}

function getNewBlock() {
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

function mineBlock(block: Block) {
  setInterval(() => {
    let nonce = 0;
    while (true) {
      logger.debug(`Miner -- Trying nonce of ${nonce}`);
      block.nonce = String(nonce);
      // send this to worker
      nonce++;
    }
  }, 1000);
}

main();
