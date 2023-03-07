"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const network_1 = require("./network");
const chain_1 = require("./chain");
const mempool_1 = require("./mempool");
const mining_1 = require("./mining");
// import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
const { Worker, isMainThread, parentPort, workerData } = require("node:worker_threads");
const BIND_PORT = 18018;
const BIND_IP = "0.0.0.0";
logger_1.logger.info(`Malibu - A Marabu node`);
logger_1.logger.info(`Dionysis Zindros <dionyziz@stanford.edu>`);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isMainThread) {
            yield chain_1.chainManager.init();
            yield mempool_1.mempool.init();
            network_1.network.init(BIND_PORT, BIND_IP);
            const worker = new Worker(__filename);
            // worker.on("message", (msg) => console.log(`Worker message received: ${msg}`));
            // worker.on("error", (err) => console.error(error));
            // worker.on("exit", (code) => console.log(`Worker exited with code ${code}.`));
        }
        else {
            mining_1.miner.mine();
        }
    });
}
main();
