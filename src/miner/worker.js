const { parentPort, workerData } = require("worker_threads");
const blake2 = require("blake2");

const TARGET = "00000000abc00000000000000000000000000000000000000000000000000000";

const { blockTemplate } = workerData;
console.log("emilyhello");
console.log(`block template is: ${blockTemplate}`);
// start mining
console.log("calling mine()");
mine();

function change_nonce(block, nonce) {
  // find the nonce string in the block
  let nonce_index = block.indexOf('"nonce":');
  let nonce_start = block.indexOf('"', nonce_index + 8);
  let nonce_end = block.indexOf('"', nonce_start + 1);
  // replace the nonce string with the new nonce
  let new_block =
    block.slice(0, nonce_start + 1) + nonce + block.slice(nonce_end, blockTemplate.length);

  // return the new block
  return new_block;
}

function hasPow(block) {
  // get the hash of the block
  let hash = blake2.createHash("blake2s");
  hash.update(Buffer.from(block));
  const hashHex = hash.digest("hex");
  // check if the hash is less than the target
  return BigInt(`0x${hashHex}`) <= BigInt(`0x${TARGET}`);
}

function getRanHex(size) {
  console.log("generating random hex...");
  let result = [];
  let hexRef = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
  for (let n = 0; n < size; n++) {
    result.push(hexRef[Math.floor(Math.random() * 16)]);
  }
  return BigInt("0x" + result.join(""));
}

function mine() {
  console.log("mining...");
  let nonce = getRanHex(32);
  let new_block = blockTemplate;
  console.log("nonce is " + nonce);
  do {
    console.log(`Miner -- Trying nonce of ${nonce}`);
    let new_block = change_nonce(blockTemplate, nonce);
    nonce++;
  } while (hasPow(new_block) == false);
  console.log(`Miner -- Found nonce of ${block.nonce}`);
  parentPort.postMessage(block);
}
