import { logger } from "./logger";
import { network } from "./network";
import { chainManager } from "./chain";
import { mempool } from "./mempool";
import { AnnotatedError } from "./message";
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
// const { Worker, isMainThread, parentPort, workerData } = require("node:worker_threads");
import { Block } from "./block";
import { TARGET } from "./block";
export const BIND_PORT = 18018;
export const BIND_IP = "0.0.0.0";

logger.info(`Malibu - A Marabu node`);
logger.info(`Dionysis Zindros <dionyziz@stanford.edu>`);

async function main() {
  await chainManager.init();
  await mempool.init();
  network.init(BIND_PORT, BIND_IP);
}

main();
