const { parentPort, workerData } = require("worker_threads");
const blake2 = require("blake2");

const TARGET = "00000000abc00000000000000000000000000000000000000000000000000000";
              //0000000000000000000000000000000000000000000000000000000000000000

const blockTemplate = workerData;
parentPort.postMessage(`message: block template is: ${blockTemplate}`);
// start mining
parentPort.postMessage("message: calling mine()");
mine();

function hasPow(block) {
  // get the hash of the block
  let hash = blake2.createHash("blake2s");
  hash.update(Buffer.from(block));
  const hashHex = hash.digest("hex");
  // check if the hash is less than the target
  return BigInt(`0x${hashHex}`) <= BigInt(`0x${TARGET}`);
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
  let nonce_index = blockTemplate.indexOf('"nonce":');
  let nonce_start = blockTemplate.indexOf('"', nonce_index + 8);
  let before_nonce = blockTemplate.slice(0, nonce_start + 1);
  let after_nonce = blockTemplate.slice(nonce_start + 1);
  do {
    new_block = before_nonce + nonce.toString(16) + after_nonce;
    // after 1000000 tries, print a message
    // if (nonce % 5000000n == 0n) {
    //   // parentPort.postMessage(`message: Miner -- Trying nonce of ${nonce.toString(16)}`);
    //   // parentPort.postMessage(`message: Miner -- new_block is ${new_block}!`);
    //   // parentPort.postMessage(`message: Miner -- block_temp is ${blockTemplate}!`);
    // }
    nonce = (nonce + 1n) % 0xffffffffffffffffffffffffffffffffn;
  } while(hasPow(new_block) == false);
  parentPort.postMessage(`message: \n--------------------\n\nMiner -- Found nonce of ${(nonce - 1n).toString(16)}!!!!!!\n--------------------\n\n`);
  parentPort.postMessage(new_block);
}
