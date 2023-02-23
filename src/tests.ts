import net from "net";
import { delay } from "./promise";

const SERVER_PORT = 18018;
const SERVER_HOST = "0.0.0.0";

const socket = new net.Socket();

socket.connect(SERVER_PORT, SERVER_HOST, async () => {
  socket.write(
    JSON.stringify({
      // hello message
      // uses stringify because received messages don't necessarily need to be in canonical form
      type: "hello",
      version: "0.9.0",
      agent: "Marabu-Core Client 0.9",
    }) + "\n"
  );

  console.log("Test 1 -- Valid Blockchain");
  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671167448,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204f48c13b24","note":"Third block","previd":"00000000352f19a602a15bcc6ae4e6aea59bb1a234962b3eb824d6819332c20c","txids":[],"type":"block"},"type":"object"}\n`
  );

  await delay(2000);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671115550,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204f606ac350","note":"Second block","previd":"0000000074c9b18be5ed6527ab7a6b398d5842e32e2f7619f0ac5b9436e53a72","txids":[],"type":"block"},"type":"object"}\n`
  );

  await delay(2000);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671106902,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cff302e97","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}\n`
  );

  await delay(2000);

  socket.write(
    `{"objectid":"0000000023c53e573cd45fcd6294e75a9d7a5b26ac6f433aa2fd6944cfb7e5fe","type":"getobject"}\n`
  );

  await delay(3000);

  console.log("Test 2 - Valid Blockchain");

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671189685,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cb913784f1","note":"Third block","previd":"000000001e5f347b48a75eb0b1e0a1602110b6cc8562953122784395efa9183f","txids":[],"type":"block"},"type":"object"}\n`
  );

  await delay(2000); // should receive get object

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671126331,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875ceac8fae6","note":"Second block","previd":"000000008fc8222b6ed6be31071aa2221672617ba10a34837ff33e313bde93b7","txids":[],"type":"block"},"type":"object"}\n`
  );

  await delay(2000); //should receive get object

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671110062,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cbfde60ca","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}\n`
  );

  await delay(2000);

  socket.write(
    `{"objectid":"000000005671363d555e1975ec2efdb8e76dd0ea6c7f02f886bec194394399f4","type":"getobject"}\n`
  );

  await delay(2000);

  console.log("Test 3 -- Valid Blockchain");
});

socket.on("data", (data) => {
  console.log(`Server sent to socket1: ${data}`);
});

socket.on("error", (error) => {
  console.error(`Server error to socket1: ${error}`);
});

socket.on("close", () => {
  console.log(`Server disconnected from socket1`);
});
