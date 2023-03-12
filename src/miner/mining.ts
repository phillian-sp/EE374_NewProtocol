import { Block } from "../block";
import { mempool } from "../mempool";
import { chainManager } from "../chain";
import { objectManager } from "../object";
import { logger } from "../logger";
import { TARGET } from "../block";
import { canonicalize } from "json-canonicalize";
import { Transaction, Output } from "../transaction";
import { sign, privkey, publickey } from "../crypto/signature";
import { assert } from "console";

const studentids = ["pmiao", "emily49", "aaryan04"];
export let current_hight = -1;

async function getNewBlock() {
  // let txids = [];
  let txids = mempool.getTxIds();
  // add coinbase transaction

  let outputs = [new Output(publickey, 50 * (10 ** 12))];
  let tx = Transaction.fromNetworkObject({
    type: "transaction",
    outputs: outputs,
    height: chainManager.longestChainHeight + 1,
    });
  current_hight = chainManager.longestChainHeight + 1;
  logger.info(`Miner -- Adding coinbase transaction ${tx.txid}`);
  assert(tx.validate(), "coinbase transaction is not valid");
  await objectManager.put(tx.toNetworkObject());
  // push coinbase transaction to the front of the array
  txids.unshift(tx.txid);
  logger.info(`Miner -- txids: ${txids}`);

  if (chainManager.longestChainTip === null) {
    logger.info(`Miner -- No chain exists to mine on.`);
    return null;
  } else {
    let previd = chainManager.longestChainTip?.blockid;
    if (previd === null) {
      logger.info(`Miner -- No chain exists to mine on.`);
      throw new Error("No chain exists to mine on.");
    }
    return new Block(
      previd,
      txids,
      "",
      TARGET,
      Math.floor(new Date().getTime() / 1000),
      "Emily",
      "Just want 50 Bu",
      studentids
    );
  }
}

export async function getBlockTemplate() {
  const template: string = canonicalize((await getNewBlock())?.toNetworkObject());
  logger.debug(`Passing block template: ${template}`);
  return template;
}
