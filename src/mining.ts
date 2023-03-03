import { mempool } from "./mempool";
import { Block, TARGET } from "./block";
import { chainManager } from "./chain";

const studentids = ["pmiao"];

export class MiningManager {
    async getNewBlock() {
        let txids = mempool.getTxIds();
        let previd = chainManager.longestChainTip?.blockid;
        return new Block(
            previd? previd : null,
            txids,
            "",
            TARGET,
            Math.floor(new Date().getTime() / 1000),
            undefined,
            undefined,
            studentids
        );
    }

    async mineBlock(block: Block) {
        let nonce = 0;
        while (!block.hasPoW()) {
            block.nonce = String(nonce);
            nonce++;
        }
        return block;
    }
}