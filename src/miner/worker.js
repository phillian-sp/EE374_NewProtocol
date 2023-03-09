const { parentPort, workerData } = require("worker_threads");
const blake2 = require("blake2");

const TARGET = "00000abc00000000000000000000000000000000000000000000000000000000";

const blockTemplate = workerData;
parentPort.postMessage(`message: block template is: ${blockTemplate}`);
// start mining
parentPort.postMessage("message: calling mine()");
// mine();

function change_nonce(block, nonce) {
  if (typeof nonce == "bigint") {
    nonce = nonce.toString(16);
  }
  // find the nonce string in the block
  let nonce_index = block.indexOf('"nonce":');
  let nonce_start = block.indexOf('"', nonce_index + 8);
  let nonce_end = block.indexOf('"', nonce_start + 1);
  // replace the nonce string with the new nonce
  let new_block =
    block.slice(0, nonce_start + 1) + nonce + block.slice(nonce_end);

  // return the new block
  return new_block;
}

function hasPow(block) {
  // get the hash of the block
  let hash = blake2.createHash("blake2s");
  hash.update(Buffer.from(block));
  const hashHex = hash.digest("hex");
  // check if the hash is less than the target
  let result = BigInt(`0x${hashHex}`) <= BigInt(`0x${TARGET}`);
  if (result) {
    parentPort.postMessage(`message: Miner -- Hash is ${hashHex}`);
  }
  return result;
}

function getRanHex(size) {
  // console.log("generating random hex...");
  let result = [];
  let hexRef = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
  for (let n = 0; n < size; n++) {
    result.push(hexRef[Math.floor(Math.random() * 16)]);
  }
  return BigInt("0x" + result.join(""));
}

function mine() {
  // console.log("mining...");
  let nonce = getRanHex(32);
  let new_block = blockTemplate;
  // console.log("nonce is " + nonce);
  do {
    // parentPort.postMessage(`message: Miner -- Trying nonce of ${nonce}`);
    new_block = change_nonce(new_block, nonce);
    // after 1000 tries, print a message
    if (nonce % 1000000n == 0n) {
      parentPort.postMessage(`message: Miner -- Trying nonce of ${nonce.toString(16)}`);
      parentPort.postMessage(`message: Miner -- new_block is ${new_block}!`);
      parentPort.postMessage(`message: Miner -- block_temp is ${blockTemplate}!`);
    }
    nonce = (nonce + 1n) % 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;
  } while(hasPow(new_block) == false);
  parentPort.postMessage(`message: Miner -- Found nonce of ${nonce}`);
  parentPort.postMessage(new_block);
}
