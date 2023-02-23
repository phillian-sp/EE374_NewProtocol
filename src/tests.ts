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

  //   console.log("Test 1 -- Valid Blockchain");
  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671167448,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204f48c13b24","note":"Third block","previd":"00000000352f19a602a15bcc6ae4e6aea59bb1a234962b3eb824d6819332c20c","txids":[],"type":"block"},"type":"object"}\n`
  //   );

  //   await delay(2000);

  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671115550,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204f606ac350","note":"Second block","previd":"0000000074c9b18be5ed6527ab7a6b398d5842e32e2f7619f0ac5b9436e53a72","txids":[],"type":"block"},"type":"object"}\n`
  //   );

  //   await delay(2000);

  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671106902,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cff302e97","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}\n`
  //   );

  //   await delay(2000);

  //   socket.write(
  //     `{"objectid":"0000000023c53e573cd45fcd6294e75a9d7a5b26ac6f433aa2fd6944cfb7e5fe","type":"getobject"}\n`
  //   );

  //   await delay(3000);

  //   console.log("Test 2 - Valid Blockchain");

  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671189685,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cb913784f1","note":"Third block","previd":"000000001e5f347b48a75eb0b1e0a1602110b6cc8562953122784395efa9183f","txids":[],"type":"block"},"type":"object"}\n`
  //   );

  //   await delay(2000); // should receive get object

  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671126331,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875ceac8fae6","note":"Second block","previd":"000000008fc8222b6ed6be31071aa2221672617ba10a34837ff33e313bde93b7","txids":[],"type":"block"},"type":"object"}\n`
  //   );

  //   await delay(2000); //should receive get object

  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671110062,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cbfde60ca","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}\n`
  //   );

  //   await delay(2000);

  //   socket.write(
  //     `{"objectid":"000000005671363d555e1975ec2efdb8e76dd0ea6c7f02f886bec194394399f4","type":"getobject"}\n`
  //   );

  //   await delay(2000);

  //   console.log("Test 3 -- Valid Blockchain");

  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671200607,"miner":"grader","nonce":"8042a948aac5e884cb3ec7db925643fd34fdd467e2cca406035cb275208410f1","note":"Third block","previd":"000000005d8d5b94e0d704bc6ab1d0a7c60f20d712d0bb461e4b6a314daf9bc0","txids":[],"type":"block"},"type":"object"}\n`
  //   );
  //   await delay(2000);

  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671135914,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cda80c903","note":"Second block","previd":"0000000052fdbc7c52d5b3ae47c6677d8ed9c9c1436017e9299d61594e43abfb","txids":[],"type":"block"},"type":"object"}\n`
  //   );

  //   await delay(2000);

  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671106560,"miner":"grader","nonce":"8042a948aac5e884cb3ec7db925643fd34fdd467e2cca406035cb2745804971f","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}\n`
  //   );

  //   await delay(2000);

  //   socket.write(
  //     `{"objectid":"000000002a5d07b3929c53864955038d7b681827d0b0be63c5d24335d60f38aa","type":"getobject"}\n`
  //   );

  //   console.log("Test 4 -- Valid Blockchain");

  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671199529,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cb934e159b","note":"Third block","previd":"000000000dd4d32d9850bb75a67c2c2a8f5b9f21fc8def74f718daf7eeafbc44","txids":[],"type":"block"},"type":"object"}\n`
  //   );

  //   await delay(2000);

  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671157822,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cbaf8d07a3","note":"Second block","previd":"000000004da09cc79bcc251a064b1b90744057f9d0c34b3f1c05934d7a2f33e0","txids":[],"type":"block"},"type":"object"}\n`
  //   );

  //   await delay(2000);

  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671099819,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b441f98e1dec","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}\n`
  //   );

  //   await delay(2000);

  //   socket.write(
  //     `{"objectid":"000000003d782708450394419016b92ac4a00c40b17664761d2c87b6c9681efc","type":"getobject"}\n`
  //   );

  //   await delay(2000);

  //   console.log("Test 5 -- Valid Blockchain");

  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671191315,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b441e64568e0","note":"Third block","previd":"000000007dab1516a1dbf3fab9e6ad87d0a87b83e87733769c77eed03fdfb664","txids":[],"type":"block"},"type":"object"}\n`
  //   );

  //   await delay(2000);

  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671122545,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b442060672cb","note":"Second block","previd":"0000000020ea349b1d2f1cecae5c1e73598521e49c1c67fde676d7951ea896f5","txids":[],"type":"block"},"type":"object"}\n`
  //   );

  //   await delay(2000);

  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671090069,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cd7dd3b27","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}\n`
  //   );

  //   await delay(2000);

  //   socket.write(
  //     `{"objectid":"00000000209b79b85363cda87de926e2b7829fbdfa0e031b23a8ef5e3271eca1","type":"getobject"}\n`
  //   );

  //   await delay(2000);

  //   console.log("Test 6 -- Non-increasing timestamps");
  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671185419,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cb96d5e3d4","note":"Second block","previd":"000000003594345d2ed18acd072c02d00925fbdffd91cb18e6e93de28eca4f24","txids":["549d3f85cdf6c7abfaee5ea962a65148ee79e54f491d42f233fc7be80217fa39","5b3a28a26992097c733b24ae9abe6788dda2cc005897c4e746e1985c138edc74"],"type":"block"},"type":"object"}\n`
  //   );

  //   await delay(2000);

  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671185419,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cc37cab04","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["17a497c5e14bc2277d142bc0677c2a70d5452ec78fe7c1279cba1837f854bde1"],"type":"block"},"type":"object"}\n`
  //   );

  //   console.log(
  //     "Test 7 -- Chain on top of blocks with non-increasing timestamps"
  //   );
  //   socket.write(
  //     `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671185419,"miner":"grader","nonce":"5f8592e30a2205a485846248987550aaf2094ec59e7931dc650c745218cfd999","note":"Third block","previd":"000000007d6d6f77c27cb9a4b12f597e4401ee77f242c89dd4479a80db6bd191","txids":["e5d80b133c19c4a41931ad25c645725576b64847993f3712c23ac0a683ec5b7c","f8be8fee401f942467866a197a8d2a8a3a3e58809154e85895810dc40cb581d9"],"type":"block"},"type":"object"}\n`
  //   );

  console.log("Test 8 -- Invalid genesis");

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671091830,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cbc61fe57f","note":"Incorrect genesis","previd":null,"txids":[],"type":"block"},"type":"object"}\n`
  );
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
