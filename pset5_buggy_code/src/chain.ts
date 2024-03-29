import { Block } from "./block";
import { logger } from "./logger";
import { mempoolManager } from "./mempool";

class ChainManager {
  longestChainHeight: number = 0;
  longestChainTip: Block | null = null;

  async init() {
    this.longestChainTip = await Block.makeGenesis();
  }
  async onValidBlockArrival(block: Block) {
    if (!block.valid) {
      throw new Error(
        `Received onValidBlockArrival() call for invalid block ${block.blockid}`
      );
    }
    const height = block.height;

    if (this.longestChainTip === null) {
      throw new Error("We do not have a local chain to compare against");
    }
    if (height === undefined) {
      throw new Error(
        `We received a block ${block.blockid} we thought was valid, but had no calculated height.`
      );
    }
    if (height > this.longestChainHeight) {
      logger.debug(
        `New longest chain has height ${height} and tip ${block.blockid}`
      );
      this.longestChainHeight = height;
      this.longestChainTip = block;
      mempoolManager.reorg(block);
    }
  }
}

export const chainManager = new ChainManager();
