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
exports.Mempool = void 0;
const logger_1 = require("../pset4_buggy_code/src/logger");
const utxo_1 = require("../pset4_buggy_code/src/utxo");
class Mempool {
    constructor(txs) {
        this.txs = [];
        this.txids = new Set();
        this.utxo = new utxo_1.UTXOSet(new Set());
        this.txs = txs;
        this.utxo.applyMultiple(txs);
        for (const tx of txs) {
            this.txids.add(tx.txid);
        }
    }
    copy() {
        return new Mempool(this.txs);
    }
    apply(tx, idx, block) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.debug(`Applying transaction ${tx.txid} to Mempool`);
            logger_1.logger.debug(`Transaction ${tx.txid} has fees ${tx.fees}`);
            logger_1.logger.debug(`Checking transaction ${tx.txid} against the current UTXO of Mempool.`);
            yield this.utxo.apply(tx, idx, block);
            logger_1.logger.debug(`Transaction ${tx.txid} is valid with respect to the current UTXO of Mempool.`);
            this.txs.push(tx);
            this.txids.add(tx.txid);
        });
    }
    applyMultiple(txs, block) {
        return __awaiter(this, void 0, void 0, function* () {
            let idx = 0;
            for (const tx of txs) {
                logger_1.logger.debug(`Applying transaction ${tx.txid} to mempool`);
                yield this.apply(tx, idx, block);
                idx += 1;
            }
        });
    }
    remove(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.debug(`Removing transaction ${tx.txid} from mempool`);
            this.txs = this.txs.filter((t) => t.txid !== tx.txid);
            this.txids.delete(tx.txid);
        });
    }
    removeMultiple(txs) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const tx of txs) {
                logger_1.logger.debug(`Removing transaction ${tx.txid} from mempool`);
                yield this.remove(tx);
            }
        });
    }
    getTx(txid) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.debug(`Getting transaction ${txid} from mempool`);
            for (const tx of this.txs) {
                if (tx.txid === txid) {
                    return tx;
                }
            }
            return undefined;
        });
    }
    getTxs() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.debug(`Getting all transactions from mempool`);
            return this.txs;
        });
    }
    getTxids() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.debug(`Getting all transaction ids from mempool`);
            return Array.from(this.txids);
        });
    }
    getFees() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.debug(`Getting all fees from mempool`);
            let fees = 0;
        });
    }
}
exports.Mempool = Mempool;
