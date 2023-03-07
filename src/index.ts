import { logger } from "./logger";
import { network } from "./network";
import { chainManager } from "./chain";
import { mempool } from "./mempool";
import { AnnotatedError } from "./message";
import { miner } from "./mining";
import { Worker, isMainThread } from "worker_threads";
// const { Worker, isMainThread, parentPort, workerData } = require("node:worker_threads");
const worker = new Worker(
  './worker.import.js',
  { 
    workerData: { 
      path: './worker.ts' 
    } 
  }
  );

const BIND_PORT = 18018;
const BIND_IP = "0.0.0.0";

logger.info(`Malibu - A Marabu node`);
logger.info(`Dionysis Zindros <dionyziz@stanford.edu>`);

async function main() {
  if (isMainThread) {
    await chainManager.init();
    await mempool.init();
    network.init(BIND_PORT, BIND_IP);
    const worker = new Worker(__filename);
    worker.on("message", (msg) => console.log(`Worker message received: ${msg}`));
    worker.on("error", (err) => console.error(err));
    worker.on("exit", (code) => console.log(`Worker exited with code ${code}.`));
  } else {
    miner.mine();
  }
}

main();
