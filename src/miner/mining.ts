import { Block } from "../block";
import { mempool } from "../mempool";
import { chainManager } from "../chain";
import { logger } from "../logger";
import { TARGET } from "../block";
import { canonicalize } from "json-canonicalize";

const studentids = ["pmiao", "emily49"];
function getNewBlock() {
  // let txids = [];
  let txids = mempool.getTxIds();
  if (chainManager.longestChainTip === null) {
    logger.info(`Miner -- No chain exists to mine on.`);
    return null;
  } else {
    let previd = chainManager.longestChainTip?.blockid;
    return new Block(
      previd ? previd : null,
      txids,
      "",
      TARGET,
      Math.floor(new Date().getTime() / 1000),
      undefined,
      undefined,
      studentids
    );
  }
}

export function getBlockTemplate() {
  const template: string = canonicalize(getNewBlock()?.toNetworkObject());
  logger.debug(`Passing block template: ${template}`);
  return template;
}
