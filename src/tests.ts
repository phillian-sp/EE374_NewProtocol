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

  console.log("Test 13 -- Future timestamp");
  

  console.log("Test 14 -- Unavailable previous block (bonus)");

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671127712,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b4421ced92f6","note":"Previous block unavailable","previd":"000000004b688f3c571186076b3e36c81dee93a29ff635f4c801ff373e05ec8f","txids":[],"type":"block"},"type":"object"}\n`
  );
  console.log(`Should receive:         {"description":"Retrieval of block parent for block 000000007baa34b9667a1edc3179eeab5f1870ac44177e6a27699111ffe4a266 failed; rejecting block: Timeout of 5000ms in retrieving object 000000004b688f3c571186076b3e36c81dee93a29ff635f4c801ff373e05ec8f exceeded","name":"UNFINDABLE_OBJECT","type":"error"}\n`);
  await delay(7000);

  console.log("Test 15 -- Valid Blockchain");

  socket.write(
    `{"blockid":"000000003e5e079059e48b50fd291c0d370d03b7ac29bfbd2d9e2cea67821aa6","type":"chaintip"}\n`
  );
  console.log(`Should receive:         {"objectid":"000000003e5e079059e48b50fd291c0d370d03b7ac29bfbd2d9e2cea67821aa6","type":"getobject"}\n`);
  await delay(500);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671426714,"miner":"grader","nonce":"5f8592e30a2205a485846248987550aaf2094ec59e7931dc650c7451ebaa7883","note":"Block 7","previd":"0000000017ec315908c0b52b4f86e3f373e7824e1b4ed577716d6fcbf16af1bd","txids":[],"type":"block"},"type":"object"}\n`
  );
  console.log(`Should receive:         {"objectid":"0000000017ec315908c0b52b4f86e3f373e7824e1b4ed577716d6fcbf16af1bd","type":"getobject"}\n`);
  await delay(500);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671355893,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b44251c0ce18","note":"Block 6","previd":"000000004e011bad33abfedaa4b32fdde6a39a57fa28e428f4f24843df223a1e","txids":[],"type":"block"},"type":"object"}\n`
  );
  console.log(`Should receive:         {"objectid":"000000004e011bad33abfedaa4b32fdde6a39a57fa28e428f4f24843df223a1e","type":"getobject"}\n`);
  await delay(500);
  
  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671319174,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875d05eae29f","note":"Block 5","previd":"00000000211f42dca9d084f1aaf38d8fe8ef87c56958de83ead19891b43c437d","txids":[],"type":"block"},"type":"object"}\n`
  );
  console.log(`Should receive:         {"objectid":"00000000211f42dca9d084f1aaf38d8fe8ef87c56958de83ead19891b43c437d","type":"getobject"}\n`);
  await delay(500);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671294586,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cc0d5fc2f4","note":"Block 4","previd":"00000000331ae5c93f9bf94c5b62bf7978b499549b8f6234d3b2743ffbd1bd58","txids":[],"type":"block"},"type":"object"}\n`
  );
  console.log(`Should receive:         {"objectid":"00000000331ae5c93f9bf94c5b62bf7978b499549b8f6234d3b2743ffbd1bd58","type":"getobject"}\n`);
  await delay(500);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671212387,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204f5d92de8e","note":"Block 3","previd":"0000000046fb03c2fcc7da4c5c1b208d64ec985595d14f60b669b106f5c3b8e7","txids":[],"type":"block"},"type":"object"}\n`
  );
  console.log(`Should receive:         {"objectid":"0000000046fb03c2fcc7da4c5c1b208d64ec985595d14f60b669b106f5c3b8e7","type":"getobject"}\n`);
  await delay(500);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671168572,"miner":"grader","nonce":"e51c9737903343947e02086541e4c48a99630aa9aece153843a4b190a053d95c","note":"Block 2","previd":"000000000f007c87b4924c8c9668c6bb10eaa8422daa4baa6eff766e114eb331","txids":[],"type":"block"},"type":"object"}\n`
  );
  console.log(`Should receive:         {"objectid":"000000000f007c87b4924c8c9668c6bb10eaa8422daa4baa6eff766e114eb331","type":"getobject"}\n`);
  await delay(500);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671093685,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875ce1504ce5","note":"Block 1","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}\n`
  );
  console.log(`Should receive:         {"objectid":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","type":"getobject"}\n`);
  await delay(500);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671062400,"miner":"Marabu","nonce":"000000000000000000000000000000000000000000000000000000021bea03ed","note":"The New York Times 2022-12-13: Scientists Achieve Nuclear Fusion Breakthrough With Blast of 192 Lasers","previd":null,"txids":[],"type":"block"},"type":"object"}\n`
  );
  await delay(500);
  
  socket.write(
    `{"type":"getchaintip"}\n`
  );
  console.log(`Should receive:         {"blockid":"000000003e5e079059e48b50fd291c0d370d03b7ac29bfbd2d9e2cea67821aa6","type":"chaintip"}\n`);
  await delay(500);

  socket.write(
    `{"objectid":"000000003e5e079059e48b50fd291c0d370d03b7ac29bfbd2d9e2cea67821aa6","type":"getobject"}\n`
  );
  console.log(`Should receive:         {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671426714,"miner":"grader","nonce":"5f8592e30a2205a485846248987550aaf2094ec59e7931dc650c7451ebaa7883","note":"Block 7","previd":"0000000017ec315908c0b52b4f86e3f373e7824e1b4ed577716d6fcbf16af1bd","txids":[],"type":"block"},"type":"object"}\n`);
  await delay(500);
  
  socket.write(
    `{"objectid":"0000000017ec315908c0b52b4f86e3f373e7824e1b4ed577716d6fcbf16af1bd","type":"getobject"}\n`
  );
  console.log(`Should receive:         {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671355893,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b44251c0ce18","note":"Block 6","previd":"000000004e011bad33abfedaa4b32fdde6a39a57fa28e428f4f24843df223a1e","txids":[],"type":"block"},"type":"object"}\n`);
  await delay(500);

  socket.write(
    `{"objectid":"000000004e011bad33abfedaa4b32fdde6a39a57fa28e428f4f24843df223a1e","type":"getobject"}\n`
  );
  console.log(`Should receive:         {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671319174,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875d05eae29f","note":"Block 5","previd":"00000000211f42dca9d084f1aaf38d8fe8ef87c56958de83ead19891b43c437d","txids":[],"type":"block"},"type":"object"}\n`);
  await delay(500);

  socket.write(
    `{"objectid":"00000000211f42dca9d084f1aaf38d8fe8ef87c56958de83ead19891b43c437d","type":"getobject"}\n`
  );
  console.log(`Should receive:         {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671294586,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cc0d5fc2f4","note":"Block 4","previd":"00000000331ae5c93f9bf94c5b62bf7978b499549b8f6234d3b2743ffbd1bd58","txids":[],"type":"block"},"type":"object"}\n`);
  await delay(500);

  socket.write(
    `{"objectid":"00000000331ae5c93f9bf94c5b62bf7978b499549b8f6234d3b2743ffbd1bd58","type":"getobject"}\n`
  );
  console.log(`Should receive:         {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671212387,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204f5d92de8e","note":"Block 3","previd":"0000000046fb03c2fcc7da4c5c1b208d64ec985595d14f60b669b106f5c3b8e7","txids":[],"type":"block"},"type":"object"}\n`);
  await delay(500);
  
  socket.write(
    `{"objectid":"0000000046fb03c2fcc7da4c5c1b208d64ec985595d14f60b669b106f5c3b8e7","type":"getobject"}\n`
  );
  console.log(`Should receive:         {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671168572,"miner":"grader","nonce":"e51c9737903343947e02086541e4c48a99630aa9aece153843a4b190a053d95c","note":"Block 2","previd":"000000000f007c87b4924c8c9668c6bb10eaa8422daa4baa6eff766e114eb331","txids":[],"type":"block"},"type":"object"}\n`);
  await delay(500);

  socket.write(
    `{"objectid":"000000000f007c87b4924c8c9668c6bb10eaa8422daa4baa6eff766e114eb331","type":"getobject"}\n`
  );
  console.log(`Should receive:         {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671093685,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875ce1504ce5","note":"Block 1","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}\n`);
  await delay(500);

  socket.write(
    `{"objectid":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","type":"getobject"}\n`
  );
  console.log(`Should receive:         {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671062400,"miner":"Marabu","nonce":"000000000000000000000000000000000000000000000000000000021bea03ed","note":"The New York Times 2022-12-13: Scientists Achieve Nuclear Fusion Breakthrough With Blast of 192 Lasers","previd":null,"txids":[],"type":"block"},"type":"object"}\n`);
  await delay(500);

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
