import { db } from "./object";
import { logger } from "./logger";
import { Hash } from "./message";
import { GENESIS_BLOCK } from "./block";

class ChaintipManager {
  height: number = 0;
  blockid: Hash =
    "0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2";

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
      await db.put(`object:${this.blockid}`, GENESIS_BLOCK.toNetworkObject());
      await db.put(`blockutxo:${this.blockid}`, []);
    }
  }

  async store() {
    await db.put("chaintipheight", this.height);
    await db.put("chaintipid", this.blockid);
    // add genesis block to database
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
