import * as ed from "@noble/ed25519";
import { Transaction } from "../transaction";
import { canonicalize } from "json-canonicalize";

export type PublicKey = string;
export type Signature = string;
export const privkey = "6a8a84dacf59c9b961eaa0406beaaa8d4fe224f440fac1997eeca930bc0cb93b";
export const publickey = "93ea8319416fe93429b778ce14726852cdf69b495c9780ebb0b843f91a7ef750";

function hex2uint8(hex: string) {
  return Uint8Array.from(Buffer.from(hex, "hex"));
}

export async function ver(sig: Signature, message: string, pubkey: PublicKey) {
  const pubkeyBuffer = hex2uint8(pubkey);
  const sigBuffer = hex2uint8(sig);
  const messageBuffer = Uint8Array.from(Buffer.from(message, "utf-8"));
  return await ed.verify(sigBuffer, messageBuffer, pubkeyBuffer);
}

export async function sign(message: string, privkey: string) {
  const privkeyBuffer = hex2uint8(privkey);
  const messageBuffer = Uint8Array.from(Buffer.from(message, "utf-8"));
  const sigBuffer = await ed.sign(messageBuffer, privkeyBuffer);
  return Buffer.from(sigBuffer).toString("hex");
}

function getRanHex(size: number) {
  // console.log("generating random hex...");
  let result = ["0", "x"];
  let hexRef = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
  for (let n = 0; n < size; n++) {
    result.push(hexRef[Math.floor(Math.random() * 16)]);
  }
  return BigInt(result.join(""));
}

export async function genKeyPair() {
  const secretKey = getRanHex(64);
  const publicKey = await ed.getPublicKey(secretKey);
  return {
    pubkey: Buffer.from(publicKey).toString("hex"),
    privkey: secretKey.toString(16),
  };
}

async function main() {
  const message = "helllooooooo";
  // const { pubkey, privkey } = await genKeyPair()
  // console.log(`pubkey: ${pubkey}`)
  // console.log(`privkey: ${privkey}`)

  const bribeTx = Transaction.fromNetworkObject({
    type: "transaction",
    inputs: [
      {
        outpoint: {
          txid: "8a27f85c390076832e161fe22ff8823171a016226ae2b6e784d91b9a4e317090",
          index: 0,
        },
        sig: null,
      },
    ],
    outputs: [
      { pubkey: "3f0bc71a375b574e4bda3ddf502fe1afd99aa020bf6049adfe525d9ad18ff33f", value: 50 * (10 ** 12) },
    ],
  });
  const sig = await sign(canonicalize(bribeTx.toNetworkObject()), privkey);
  console.log("signature: " + sig);
  console.log("verify: " + (await ver(sig, canonicalize(bribeTx.toNetworkObject()), publickey)));
  console.log("original: " + canonicalize(bribeTx.toNetworkObject()));
  // console.log("verify: " + (await ver(sig, bribe, publickey)));

  // signed: {"type":"transaction","inputs":[{"outpoint":{"txid":"405818f0174b9a1b355f08c00e98aebf5e316b62dd804e15525597f797cebf7d","index":0},"sig":"da9c123c010995045dd17550370233086741d072cc230414b239954a67c6fea3e22e8eaff9e1828fab9dfe74f84dc4f60e932d054f8e68ad132e5da3e4d4f800"}],"outputs":[{"pubkey":"3f0bc71a375b574e4bda3ddf502fe1afd99aa020bf6049adfe525d9ad18ff33f","value":50}]}
}

// main();
