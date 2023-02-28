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
exports.chaintipManager = void 0;
const object_1 = require("./object");
const logger_1 = require("./logger");
const block_1 = require("./block");
class ChaintipManager {
    constructor() {
        this.height = 0;
        this.blockid = "0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2";
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.height = yield object_1.db.get("chaintipheight");
                this.blockid = yield object_1.db.get("chaintipid");
                logger_1.logger.debug(`Loaded known chaintip -- Height: ${this.height}, Blockid: ${this.blockid}`);
            }
            catch (_a) {
                logger_1.logger.debug(`Initializing chaintip database`);
                yield this.store();
                yield object_1.db.put(`object:${this.blockid}`, block_1.GENESIS_BLOCK.toNetworkObject());
                yield object_1.db.put(`blockutxo:${this.blockid}`, []);
            }
        });
    }
    store() {
        return __awaiter(this, void 0, void 0, function* () {
            yield object_1.db.put("chaintipheight", this.height);
            yield object_1.db.put("chaintipid", this.blockid);
            // add genesis block to database
        });
    }
    setLongestTip(height, blockid) {
        this.height = height;
        this.blockid = blockid;
        this.store();
        logger_1.logger.info(`Longest chaintip -- height: ${this.height}, blockid: ${this.blockid}`);
    }
}
exports.chaintipManager = new ChaintipManager();
