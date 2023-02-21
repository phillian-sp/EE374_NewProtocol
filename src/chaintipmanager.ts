import { db } from "./object";
import { logger } from "./logger";
import { Hash } from "./message";

class ChaintipManager {
  height: number = -1;
  blockid?: Hash = "";

  async load() {
    try {
      this.height = await db.get("chaintipheight");
      this.blockid = await db.get("chaintipid");
      logger.debug(
        `Loaded known chaintip -- Height: ${this.height}, Blockid: ${this.blockid}`
      );
    } catch {
      logger.debug(`Initializing chaintip database`);
      await this.store();
    }
  }

  async store() {
    await db.put("chaintipheight", this.height);
    await db.put("chaintipid", this.blockid);
  }

  setLongestTip(height: number, blockid: Hash) {
    this.height = height;
    this.blockid = blockid;
    this.store();
    logger.info(
      `Longest chaintip -- height: ${this.height}, blockid: ${this.blockid}`
    );
  }
}

export const chaintipManager = new ChaintipManager();
