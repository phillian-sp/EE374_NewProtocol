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
exports.miner = void 0;
const mempool_1 = require("./mempool");
const block_1 = require("./block");
const chain_1 = require("./chain");
const logger_1 = require("./logger");
const object_1 = require("./object");
const network_1 = require("./network");
const studentids = ["pmiao", "emily49", "aaryan04"];
class Miner {
    mine() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("mining...");
            while (true) {
                const block = this.getNewBlock();
                if (block) {
                    const minedBlock = this.mineBlock(block);
                    yield minedBlock.validate(network_1.network.peers[0]);
                    yield object_1.objectManager.put(minedBlock.toNetworkObject());
                    network_1.network.broadcast({
                        type: "ihaveobject",
                        objectid: minedBlock.blockid,
                    });
                    logger_1.logger.info(`Succesfully mined, validated, and broadcasted block with blockid ${minedBlock.blockid}.`);
                    logger_1.logger.info(`Full block is: ${minedBlock.toNetworkObject()}`);
                }
            }
        });
    }
    getNewBlock() {
        var _a;
        let txids = mempool_1.mempool.getTxIds();
        if (chain_1.chainManager.longestChainTip == null) {
            logger_1.logger.info(`Miner -- No chain exists to mine on.`);
            return null;
        }
        else {
            let previd = (_a = chain_1.chainManager.longestChainTip) === null || _a === void 0 ? void 0 : _a.blockid;
            return new block_1.Block(previd ? previd : null, txids, "", block_1.TARGET, Math.floor(new Date().getTime() / 1000), undefined, undefined, studentids);
        }
    }
    mineBlock(block) {
        let nonce = 0;
        do {
            logger_1.logger.debug(`Miner -- Trying nonce of ${nonce}`);
            block.nonce = String(nonce);
            nonce++;
        } while (!block.hasPoW());
        return block;
    }
}
exports.miner = new Miner();
