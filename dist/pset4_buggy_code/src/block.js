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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GENESIS_BLOCK = exports.Block = void 0;
const message_1 = require("./message");
const hash_1 = require("./crypto/hash");
const json_canonicalize_1 = require("json-canonicalize");
const object_1 = require("./object");
const util_1 = __importDefault(require("util"));
const utxo_1 = require("./utxo");
const logger_1 = require("./logger");
const transaction_1 = require("./transaction");
const chaintipmanager_1 = require("./chaintipmanager");
const TARGET = "00000000abc00000000000000000000000000000000000000000000000000000";
const GENESIS = {
    T: TARGET,
    created: 1671062400,
    miner: "Marabu",
    nonce: "000000000000000000000000000000000000000000000000000000021bea03ed",
    note: "The New York Times 2022-12-13: Scientists Achieve Nuclear Fusion Breakthrough With Blast of 192 Lasers",
    previd: null,
    txids: [],
    type: "block",
};
const BU = 10 ** 12;
const BLOCK_REWARD = 50 * BU;
class Block {
    static fromNetworkObject(object) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Block(object.previd, object.txids, object.nonce, object.T, object.created, object.miner, object.note, object.studentids);
        });
    }
    constructor(previd, txids, nonce, T, created, miner, note, studentids) {
        this.previd = previd;
        this.txids = txids;
        this.nonce = nonce;
        this.T = T;
        this.created = created;
        this.miner = miner;
        this.note = note;
        this.studentids = studentids;
        this.blockid = (0, hash_1.hash)((0, json_canonicalize_1.canonicalize)(this.toNetworkObject()));
    }
    // static getGenesisBlock(): Block {
    //   const genesis = new Block(GENESIS.previd, GENESIS.txids, GENESIS.nonce, GENESIS.T, GENESIS.created, GENESIS.miner, GENESIS.note, undefined)
    //   return genesis
    // }
    // static async add_genesis_block() {
    //   const block = Block.getGenesisBlock()
    //   await objectManager.put(block.toNetworkObject())
    //   await db.put(`blockutxo:${block.blockid}`, [])
    // }
    loadStateAfter() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return new utxo_1.UTXOSet(new Set(yield object_1.db.get(`blockutxo:${this.blockid}`)));
            }
            catch (e) {
                return;
            }
        });
    }
    getCoinbase() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.txids.length === 0) {
                throw new Error("The block has no coinbase transaction");
            }
            const txid = this.txids[0];
            logger_1.logger.debug(`Checking whether ${txid} is the coinbase`);
            const obj = yield object_1.objectManager.get(txid);
            if (!message_1.TransactionObject.guard(obj)) {
                throw new Error("The block contains non-transaction txids");
            }
            const tx = transaction_1.Transaction.fromNetworkObject(obj);
            if (tx.isCoinbase()) {
                return tx;
            }
            throw new Error("The block has no coinbase transaction");
        });
    }
    toNetworkObject() {
        const netObj = {
            type: "block",
            previd: this.previd,
            txids: this.txids,
            nonce: this.nonce,
            T: this.T,
            created: this.created,
            miner: this.miner,
        };
        if (this.note !== undefined) {
            netObj.note = this.note;
        }
        if (this.studentids !== undefined) {
            netObj.studentids = this.studentids;
        }
        return netObj;
    }
    hasPoW() {
        return BigInt(`0x${this.blockid}`) <= BigInt(`0x${TARGET}`);
    }
    isGenesis() {
        return this.previd === null;
    }
    /**
     * Get the height of the block. If the height is already known, it is returned
     * immediately. Otherwise, the parent block is retrieved and the height of the
     * parent block is retrieved recursively. If the parent block is the genesis
     * block, the height of the block is 0. Otherwise, the height of the block is
     * the height of the parent block plus 1.
     *
     * @param peer the peer from which to retrieve the block
     * @returns the height of the block
     */
    getHeight(peer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.height !== undefined) {
                return this.height;
            }
            // if height is undefined, we need to have peer as an argument
            if (peer === undefined) {
                throw new message_1.AnnotatedError("INTERNAL_ERROR", "Block height is undefined, but no peer was provided to retrieve it from");
            }
            let parentBlock = yield this.validateAncestry(peer);
            // if the block has no parent, it is the genesis block
            if (parentBlock === null) {
                this.height = 0;
            }
            else {
                this.height = (yield parentBlock.getHeight()) + 1;
            }
            return this.height;
        });
    }
    /**
     * Get the transactions of the block.
     *
     * @param peer the peer from which to retrieve the transactions
     * @returns the transactions of the block
     */
    getTxs(peer) {
        return __awaiter(this, void 0, void 0, function* () {
            const txPromises = [];
            let maybeTransactions = [];
            const txs = [];
            // push all transaction retrieval promises to an array
            for (const txid of this.txids) {
                if (peer === undefined) {
                    txPromises.push(object_1.objectManager.get(txid));
                }
                else {
                    txPromises.push(object_1.objectManager.retrieve(txid, peer));
                }
            }
            // wait for all transactions to be retrieved
            // if one fails, reject the block
            try {
                maybeTransactions = yield Promise.all(txPromises);
            }
            catch (e) {
                throw new message_1.AnnotatedError("UNFINDABLE_OBJECT", `Retrieval of transactions of block ${this.blockid} failed; rejecting block`);
            }
            logger_1.logger.debug(`We have all ${this.txids.length} transactions of block ${this.blockid}`);
            // check that all retrieved objects are transactions
            for (const maybeTx of maybeTransactions) {
                if (!message_1.TransactionObject.guard(maybeTx)) {
                    throw new message_1.AnnotatedError("UNFINDABLE_OBJECT", `Block reports a transaction with id ${object_1.objectManager.id(maybeTx)}, but this is not a transaction.`);
                }
                const tx = transaction_1.Transaction.fromNetworkObject(maybeTx);
                txs.push(tx);
            }
            return txs;
        });
    }
    /**
     * Validate the block's transactions and calculate the UTXO state after the block.
     *
     * @param peer the peer from which to retrieve the transactions
     * @param stateBefore the UTXO state before the block
     * @returns the UTXO state after the block
     * @throws AnnotatedError if the block is invalid
     */
    validateTx(peer, stateBefore) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.debug(`Validating ${this.txids.length} transactions of block ${this.blockid}`);
            const stateAfter = stateBefore.copy();
            // wait for all transactions to be retrieved
            const txs = yield this.getTxs(peer);
            for (let idx = 0; idx < txs.length; idx++) {
                yield txs[idx].validate(idx, this);
            }
            yield stateAfter.applyMultiple(txs, this);
            logger_1.logger.debug(`UTXO state of block ${this.blockid} calculated`);
            let fees = 0;
            for (const tx of txs) {
                if (tx.fees === undefined) {
                    throw new message_1.AnnotatedError("INTERNAL_ERROR", `Transaction fees not calculated`);
                }
                fees += tx.fees;
            }
            this.fees = fees;
            let coinbase;
            try {
                coinbase = yield this.getCoinbase();
            }
            catch (e) { }
            if (coinbase !== undefined) {
                // check that the coinbase transaction respects macroeconomic policy
                if (coinbase.outputs[0].value > BLOCK_REWARD + fees) {
                    throw new message_1.AnnotatedError("INVALID_BLOCK_COINBASE", `Coinbase transaction does not respect macroeconomic policy. ` +
                        `Coinbase output was ${coinbase.outputs[0].value}, while reward is ${BLOCK_REWARD} and fees were ${fees}.`);
                }
                // determine its height and check that its height field matches the height of the block
                if (coinbase.height != (yield this.getHeight(peer))) {
                    throw new message_1.AnnotatedError("INVALID_BLOCK_COINBASE", `Coinbase transaction ${coinbase.txid} has height ${coinbase.height}, but block ${this.blockid} has height ${this.getHeight()}`);
                }
            }
            yield object_1.db.put(`blockutxo:${this.blockid}`, Array.from(stateAfter.outpoints));
            logger_1.logger.debug(`UTXO state of block ${this.blockid} cached: ${JSON.stringify(Array.from(stateAfter.outpoints))}`);
        });
    }
    /**
     * Validates the block's ancestry, i.e. whether the parent block is valid and can be found.
     *
     * @param peer The peer from which to retrieve the parent block
     * @returns The parent block, if it is valid and can be found
     * @throws AnnotatedError if the parent block is not valid or cannot be found
     */
    validateAncestry(peer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.previd === null) {
                // genesis
                return null;
            }
            let parentBlock;
            try {
                logger_1.logger.debug(`Retrieving parent block of ${this.blockid} (${this.previd})`);
                // throws an error if the parent block is not found within the timeout
                const parentObject = yield object_1.objectManager.retrieve(this.previd, peer);
                if (!message_1.BlockObject.guard(parentObject)) {
                    throw new message_1.AnnotatedError("UNFINDABLE_OBJECT", `Got parent of block ${this.blockid}, but it was not of BlockObject type; rejecting block.`);
                }
                parentBlock = yield Block.fromNetworkObject(parentObject);
                yield parentBlock.validate(peer);
            }
            catch (e) {
                throw new message_1.AnnotatedError("UNFINDABLE_OBJECT", `Retrieval of block parent for block ${this.blockid} failed; rejecting block: ${e.message}`);
            }
            return parentBlock;
        });
    }
    validate(peer) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.debug(`Validating block ${this.blockid}`);
            try {
                if (this.T !== TARGET) {
                    throw new message_1.AnnotatedError("INVALID_FORMAT", `Block ${this.blockid} does not specify the fixed target ${TARGET}, but uses target ${this.T} instead.`);
                }
                logger_1.logger.debug(`Block target for ${this.blockid} is valid`);
                if (!this.hasPoW()) {
                    throw new message_1.AnnotatedError("INVALID_BLOCK_POW", `Block ${this.blockid} does not satisfy the proof-of-work equation; rejecting block.`);
                }
                logger_1.logger.debug(`Block proof-of-work for ${this.blockid} is valid`);
                // Ensure if present that the note and miner fields in a block are ASCII-printable strings
                // up to 128 characters long each. ASCII printable characters are those with decimal values
                //  32 up to 126. If this is not the case, send back an INVALID_FORMAT error.
                if (this.note !== null) {
                    if (!((_a = this.note) === null || _a === void 0 ? void 0 : _a.match(/^[\x20-\x7e]{1,128}$/))) {
                        throw new message_1.AnnotatedError("INVALID_FORMAT", `Block ${this.blockid} has a note field that is not a string of ASCII-printable characters up to 128 characters long.`);
                    }
                }
                logger_1.logger.debug(`Block note for ${this.blockid} is valid`);
                if (this.miner !== null) {
                    if (!((_b = this.miner) === null || _b === void 0 ? void 0 : _b.match(/^[\x20-\x7e]{1,128}$/))) {
                        throw new message_1.AnnotatedError("INVALID_FORMAT", `Block ${this.blockid} has a miner field that is not a string of ASCII-printable characters up to 128 characters long.`);
                    }
                }
                /*
                 * Ensure if present that the studentids field is an array with at most 10 ASCII-printable
                 * strings each containing up to 128 characters. If the studentids field is present but does
                 * not follow these constraints, send back an INVALID_FORMAT error
                 */
                if (this.studentids !== null) {
                    if (this.studentids && this.studentids.length > 10) {
                        throw new message_1.AnnotatedError("INVALID_FORMAT", `Block ${this.blockid} has a studentids field that is not an array with at most 10 ASCII-printable strings.`);
                    }
                    for (const studentid of (_c = this.studentids) !== null && _c !== void 0 ? _c : []) {
                        if (!studentid.match(/^[\x20-\x7e]{1,128}$/)) {
                            throw new message_1.AnnotatedError("INVALID_FORMAT", `Block ${this.blockid} has a studentids field that is not an array with strings each containing up to 128 characters.`);
                        }
                    }
                }
                let parentBlock = null;
                let stateBefore;
                // validate ancestor blocks
                if (this.isGenesis()) {
                    if (!util_1.default.isDeepStrictEqual(this.toNetworkObject(), GENESIS)) {
                        throw new message_1.AnnotatedError("INVALID_GENESIS", `Invalid genesis block ${this.blockid}: ${JSON.stringify(this.toNetworkObject())}`);
                    }
                    logger_1.logger.debug(`Block ${this.blockid} is genesis block`);
                    // genesis state
                    stateBefore = new utxo_1.UTXOSet(new Set());
                    logger_1.logger.debug(`State before block ${this.blockid} is the genesis state`);
                }
                else {
                    // validate parent blocks
                    parentBlock = yield this.validateAncestry(peer);
                    if (parentBlock === null) {
                        throw new message_1.AnnotatedError("UNFINDABLE_OBJECT", `Parent block of block ${this.blockid} was null`);
                    }
                    // this block's starting state is the previous block's ending state
                    stateBefore = yield parentBlock.loadStateAfter();
                    logger_1.logger.debug(`Loaded state before block ${this.blockid}`);
                }
                logger_1.logger.debug(`Block ${this.blockid} has valid ancestry`);
                if (stateBefore === undefined) {
                    throw new message_1.AnnotatedError("UNFINDABLE_OBJECT", `We have not calculated the state of the parent block,` +
                        `so we cannot calculate the state of the current block with blockid = ${this.blockid}`);
                }
                // Check that the timestamp of each block (the created field) is later than that of its parent,
                // and earlier than the current time.
                if (parentBlock !== null && this.created <= parentBlock.created) {
                    throw new message_1.AnnotatedError("INVALID_BLOCK_TIMESTAMP", `Block ${this.blockid} has timestamp ${this.created}, ` +
                        `which is not later than the timestamp of its parent ${parentBlock.blockid} (${parentBlock.created})`);
                }
                // get current time
                const second = Math.floor(Date.now() / 1000);
                if (this.created > second) {
                    throw new message_1.AnnotatedError("INVALID_BLOCK_TIMESTAMP", `Block ${this.blockid} has timestamp ${this.created}, ` +
                        `which is later than the current time ${second}`);
                }
                logger_1.logger.debug(`State before block ${this.blockid} is ${stateBefore}`);
                yield this.validateTx(peer, stateBefore);
                logger_1.logger.debug(`Block ${this.blockid} has valid transactions`);
                if ((yield this.getHeight(peer)) > chaintipmanager_1.chaintipManager.height) {
                    // logger.debug(
                    //   `Block ${this.blockid} is the longest chain with height ${this.height}`
                    // );
                    chaintipmanager_1.chaintipManager.setLongestTip(yield this.getHeight(peer), this.blockid);
                }
            }
            catch (e) {
                throw e;
            }
        });
    }
}
exports.Block = Block;
exports.GENESIS_BLOCK = new Block(GENESIS.previd, GENESIS.txids, GENESIS.nonce, GENESIS.T, GENESIS.created, GENESIS.miner, GENESIS.note, undefined);
