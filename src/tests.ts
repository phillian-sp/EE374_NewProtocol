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

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671200607,"miner":"grader","nonce":"8042a948aac5e884cb3ec7db925643fd34fdd467e2cca406035cb275208410f1","note":"Third block","previd":"000000005d8d5b94e0d704bc6ab1d0a7c60f20d712d0bb461e4b6a314daf9bc0","txids":[],"type":"block"},"type":"object"}\n`
  );
  await delay(2000);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671135914,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cda80c903","note":"Second block","previd":"0000000052fdbc7c52d5b3ae47c6677d8ed9c9c1436017e9299d61594e43abfb","txids":[],"type":"block"},"type":"object"}\n`
  );

  await delay(2000);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671106560,"miner":"grader","nonce":"8042a948aac5e884cb3ec7db925643fd34fdd467e2cca406035cb2745804971f","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}\n`
  );

  await delay(2000);

  socket.write(
    `{"objectid":"000000002a5d07b3929c53864955038d7b681827d0b0be63c5d24335d60f38aa","type":"getobject"}\n`
  );

  console.log("Test 4 -- Valid Blockchain");

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671199529,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cb934e159b","note":"Third block","previd":"000000000dd4d32d9850bb75a67c2c2a8f5b9f21fc8def74f718daf7eeafbc44","txids":[],"type":"block"},"type":"object"}\n`
  );

  await delay(2000);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671157822,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cbaf8d07a3","note":"Second block","previd":"000000004da09cc79bcc251a064b1b90744057f9d0c34b3f1c05934d7a2f33e0","txids":[],"type":"block"},"type":"object"}\n`
  );

  await delay(2000);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671099819,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b441f98e1dec","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}\n`
  );

  await delay(2000);

  socket.write(
    `{"objectid":"000000003d782708450394419016b92ac4a00c40b17664761d2c87b6c9681efc","type":"getobject"}\n`
  );

  await delay(2000);

  console.log("Test 5 -- Valid Blockchain");

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671191315,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b441e64568e0","note":"Third block","previd":"000000007dab1516a1dbf3fab9e6ad87d0a87b83e87733769c77eed03fdfb664","txids":[],"type":"block"},"type":"object"}\n`
  );

  await delay(2000);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671122545,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b442060672cb","note":"Second block","previd":"0000000020ea349b1d2f1cecae5c1e73598521e49c1c67fde676d7951ea896f5","txids":[],"type":"block"},"type":"object"}\n`
  );

  await delay(2000);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671090069,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cd7dd3b27","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}\n`
  );

  await delay(2000);

  socket.write(
    `{"objectid":"00000000209b79b85363cda87de926e2b7829fbdfa0e031b23a8ef5e3271eca1","type":"getobject"}\n`
  );

  await delay(2000);

  console.log("Test 6 -- Non-increasing timestamps");
  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671185419,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cb96d5e3d4","note":"Second block","previd":"000000003594345d2ed18acd072c02d00925fbdffd91cb18e6e93de28eca4f24","txids":["549d3f85cdf6c7abfaee5ea962a65148ee79e54f491d42f233fc7be80217fa39","5b3a28a26992097c733b24ae9abe6788dda2cc005897c4e746e1985c138edc74"],"type":"block"},"type":"object"}\n`
  );

  await delay(2000);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671185419,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875cc37cab04","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["17a497c5e14bc2277d142bc0677c2a70d5452ec78fe7c1279cba1837f854bde1"],"type":"block"},"type":"object"}\n`
  );

  console.log(
    "Test 7 -- Chain on top of blocks with non-increasing timestamps"
  );
  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671185419,"miner":"grader","nonce":"5f8592e30a2205a485846248987550aaf2094ec59e7931dc650c745218cfd999","note":"Third block","previd":"000000007d6d6f77c27cb9a4b12f597e4401ee77f242c89dd4479a80db6bd191","txids":["e5d80b133c19c4a41931ad25c645725576b64847993f3712c23ac0a683ec5b7c","f8be8fee401f942467866a197a8d2a8a3a3e58809154e85895810dc40cb581d9"],"type":"block"},"type":"object"}\n`
  );

  console.log("Test 8 -- Invalid genesis");

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671091830,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cbc61fe57f","note":"Incorrect genesis","previd":null,"txids":[],"type":"block"},"type":"object"}\n`
  );

  console.log("Test 9 -- Chain on invalid genesis");

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671198319,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b441f8e39628","note":"Second block","previd":"0000000083045fc871b6108b153ee316214a9c477aac9d0dadc0a488b60bf9c6","txids":["549d3f85cdf6c7abfaee5ea962a65148ee79e54f491d42f233fc7be80217fa39"],"type":"block"},"type":"object"}\n`
  );

  await delay(2000);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671174039,"miner":"grader","nonce":"8042a948aac5e884cb3ec7db925643fd34fdd467e2cca406035cb2747a0ebe34","note":"First block","previd":"000000009c70351d696bd22239abd8c7e93c88d4b1de1364d393bb7da20d14c8","txids":["17a497c5e14bc2277d142bc0677c2a70d5452ec78fe7c1279cba1837f854bde1"],"type":"block"},"type":"object"}\n`
  );

  console.log("Test 10 -- Incorrect height coinbase");
  // first send transactions
  socket.write(
    `{"object":{"height":2,"outputs":[{"pubkey":"bfd714d581342739b3f31542e87cebc48b645b3a96c9251bc1a9d1a0dda59b29","value":50000000000000}],"type":"transaction"},"type":"object"}\n`
  );

  socket.write(
    `{"object":{"height":4,"outputs":[{"pubkey":"bfd714d581342739b3f31542e87cebc48b645b3a96c9251bc1a9d1a0dda59b29","value":50000000000000}],"type":"transaction"},"type":"object"}\n`
  );

  socket.write(
    `{"object":{"height":1,"outputs":[{"pubkey":"bfd714d581342739b3f31542e87cebc48b645b3a96c9251bc1a9d1a0dda59b29","value":50000000000000}],"type":"transaction"},"type":"object"}\n`
  );

  // now for the tests
  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671152671,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204efd6066e9","note":"Third block","previd":"000000003c333f6bfac73bf937bfe6966861dd93c2bc790b7e360427ee656aba","txids":["8790187596c417cc41fe632bb1eaa779e0529dc256a37df9c531d012198a0b18"],"type":"block"},"type":"object"}\n`
  );

  await delay(2000);

  socket.write(
    ` {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671115165,"miner":"grader","nonce":"e51c9737903343947e02086541e4c48a99630aa9aece153843a4b1903f3964d0","note":"Second block","previd":"000000000bf5ed1ee86cb47cc81489f4eaadbb59802e7b65ad87e89dce825417","txids":["36e2f567d8a144ae8cd55fffae636d747c7d1ed77f965c2ba7d5036f63c017dd"],"type":"block"},"type":"object"}\n`
  );

  await delay(2000);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671107316,"miner":"grader","nonce":"e51c9737903343947e02086541e4c48a99630aa9aece153843a4b190447b3bae","note":"First block","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":["058d7388dc7410baacf71112bc3b1c2820c9c329edf6397093647c601ff84777"],"type":"block"},"type":"object"}\n`
  );

  console.log("Test 11 -- Invalid PoW");

  // find the transactions
  socket.write(
    `{"object":{"inputs":[{"outpoint":{"index":0,"txid":"549d3f85cdf6c7abfaee5ea962a65148ee79e54f491d42f233fc7be80217fa39"},"sig":"a8ec77333ba2844f7686d056af2996cb87de14a564ffd48ad409db5274057f2f1e827419c4a18ce920e22e9e1f5f42c583d67d2fb4ed2c75e29261606a34100f"}],"outputs":[{"pubkey":"098a6f1ed9b34134f13b8166991670cd108af7ec3c4012939ef23c5393f0092d","value":30000000000000}],"type":"transaction"},"type":"object"}\n`
  );

  socket.write(
    `{"object":{"height":3,"outputs":[{"pubkey":"098a6f1ed9b34134f13b8166991670cd108af7ec3c4012939ef23c5393f0092d","value":80000000000000}],"type":"transaction"},"type":"object"}\n`
  );

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671144272,"miner":"grader","nonce":"","note":"Second block","previd":"0000000056f0d634f21e4f6218aa97872d25e10b2555fa9c48c30dd53aa850ca","txids":["549d3f85cdf6c7abfaee5ea962a65148ee79e54f491d42f233fc7be80217fa39","5b3a28a26992097c733b24ae9abe6788dda2cc005897c4e746e1985c138edc74"],"type":"block"},"type":"object"}\n`
  );

  // test

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671218865,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204ef42fef58","note":"Third block","previd":"ae67ade96499cf371064cd98af0b4d5c5550616f71297554aa85f2a5bf367ba2","txids":["e5d80b133c19c4a41931ad25c645725576b64847993f3712c23ac0a683ec5b7c","f8be8fee401f942467866a197a8d2a8a3a3e58809154e85895810dc40cb581d9"],"type":"block"},"type":"object"}\n`
  );

  console.log("Test 13 -- Future timestamp");

  console.log("Test 14 -- Unavailable previous block (bonus)");

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671127712,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b4421ced92f6","note":"Previous block unavailable","previd":"000000004b688f3c571186076b3e36c81dee93a29ff635f4c801ff373e05ec8f","txids":[],"type":"block"},"type":"object"}\n`
  );
  console.log(
    `Should receive:         {"description":"Retrieval of block parent for block 000000007baa34b9667a1edc3179eeab5f1870ac44177e6a27699111ffe4a266 failed; rejecting block: Timeout of 5000ms in retrieving object 000000004b688f3c571186076b3e36c81dee93a29ff635f4c801ff373e05ec8f exceeded","name":"UNFINDABLE_OBJECT","type":"error"}\n`
  );
  await delay(7000);

  console.log("Test 15 -- Valid Blockchain");

  socket.write(
    `{"blockid":"000000003e5e079059e48b50fd291c0d370d03b7ac29bfbd2d9e2cea67821aa6","type":"chaintip"}\n`
  );
  console.log(
    `Should receive:         {"objectid":"000000003e5e079059e48b50fd291c0d370d03b7ac29bfbd2d9e2cea67821aa6","type":"getobject"}\n`
  );
  await delay(500);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671426714,"miner":"grader","nonce":"5f8592e30a2205a485846248987550aaf2094ec59e7931dc650c7451ebaa7883","note":"Block 7","previd":"0000000017ec315908c0b52b4f86e3f373e7824e1b4ed577716d6fcbf16af1bd","txids":[],"type":"block"},"type":"object"}\n`
  );
  console.log(
    `Should receive:         {"objectid":"0000000017ec315908c0b52b4f86e3f373e7824e1b4ed577716d6fcbf16af1bd","type":"getobject"}\n`
  );
  await delay(500);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671355893,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b44251c0ce18","note":"Block 6","previd":"000000004e011bad33abfedaa4b32fdde6a39a57fa28e428f4f24843df223a1e","txids":[],"type":"block"},"type":"object"}\n`
  );
  console.log(
    `Should receive:         {"objectid":"000000004e011bad33abfedaa4b32fdde6a39a57fa28e428f4f24843df223a1e","type":"getobject"}\n`
  );
  await delay(500);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671319174,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875d05eae29f","note":"Block 5","previd":"00000000211f42dca9d084f1aaf38d8fe8ef87c56958de83ead19891b43c437d","txids":[],"type":"block"},"type":"object"}\n`
  );
  console.log(
    `Should receive:         {"objectid":"00000000211f42dca9d084f1aaf38d8fe8ef87c56958de83ead19891b43c437d","type":"getobject"}\n`
  );
  await delay(500);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671294586,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cc0d5fc2f4","note":"Block 4","previd":"00000000331ae5c93f9bf94c5b62bf7978b499549b8f6234d3b2743ffbd1bd58","txids":[],"type":"block"},"type":"object"}\n`
  );
  console.log(
    `Should receive:         {"objectid":"00000000331ae5c93f9bf94c5b62bf7978b499549b8f6234d3b2743ffbd1bd58","type":"getobject"}\n`
  );
  await delay(500);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671212387,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204f5d92de8e","note":"Block 3","previd":"0000000046fb03c2fcc7da4c5c1b208d64ec985595d14f60b669b106f5c3b8e7","txids":[],"type":"block"},"type":"object"}\n`
  );
  console.log(
    `Should receive:         {"objectid":"0000000046fb03c2fcc7da4c5c1b208d64ec985595d14f60b669b106f5c3b8e7","type":"getobject"}\n`
  );
  await delay(500);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671168572,"miner":"grader","nonce":"e51c9737903343947e02086541e4c48a99630aa9aece153843a4b190a053d95c","note":"Block 2","previd":"000000000f007c87b4924c8c9668c6bb10eaa8422daa4baa6eff766e114eb331","txids":[],"type":"block"},"type":"object"}\n`
  );
  console.log(
    `Should receive:         {"objectid":"000000000f007c87b4924c8c9668c6bb10eaa8422daa4baa6eff766e114eb331","type":"getobject"}\n`
  );
  await delay(500);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671093685,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875ce1504ce5","note":"Block 1","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}\n`
  );
  console.log(
    `Should receive:         {"objectid":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","type":"getobject"}\n`
  );
  await delay(500);

  socket.write(
    `{"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671062400,"miner":"Marabu","nonce":"000000000000000000000000000000000000000000000000000000021bea03ed","note":"The New York Times 2022-12-13: Scientists Achieve Nuclear Fusion Breakthrough With Blast of 192 Lasers","previd":null,"txids":[],"type":"block"},"type":"object"}\n`
  );
  await delay(500);

  socket.write(`{"type":"getchaintip"}\n`);
  console.log(
    `Should receive:         {"blockid":"000000003e5e079059e48b50fd291c0d370d03b7ac29bfbd2d9e2cea67821aa6","type":"chaintip"}\n`
  );
  await delay(500);

  socket.write(
    `{"objectid":"000000003e5e079059e48b50fd291c0d370d03b7ac29bfbd2d9e2cea67821aa6","type":"getobject"}\n`
  );
  console.log(
    `Should receive:         {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671426714,"miner":"grader","nonce":"5f8592e30a2205a485846248987550aaf2094ec59e7931dc650c7451ebaa7883","note":"Block 7","previd":"0000000017ec315908c0b52b4f86e3f373e7824e1b4ed577716d6fcbf16af1bd","txids":[],"type":"block"},"type":"object"}\n`
  );
  await delay(500);

  socket.write(
    `{"objectid":"0000000017ec315908c0b52b4f86e3f373e7824e1b4ed577716d6fcbf16af1bd","type":"getobject"}\n`
  );
  console.log(
    `Should receive:         {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671355893,"miner":"grader","nonce":"76931fac9dab2b36c248b87d6ae33f9a62d7183a5d5789e4b2d6b44251c0ce18","note":"Block 6","previd":"000000004e011bad33abfedaa4b32fdde6a39a57fa28e428f4f24843df223a1e","txids":[],"type":"block"},"type":"object"}\n`
  );
  await delay(500);

  socket.write(
    `{"objectid":"000000004e011bad33abfedaa4b32fdde6a39a57fa28e428f4f24843df223a1e","type":"getobject"}\n`
  );
  console.log(
    `Should receive:         {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671319174,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875d05eae29f","note":"Block 5","previd":"00000000211f42dca9d084f1aaf38d8fe8ef87c56958de83ead19891b43c437d","txids":[],"type":"block"},"type":"object"}\n`
  );
  await delay(500);

  socket.write(
    `{"objectid":"00000000211f42dca9d084f1aaf38d8fe8ef87c56958de83ead19891b43c437d","type":"getobject"}\n`
  );
  console.log(
    `Should receive:         {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671294586,"miner":"grader","nonce":"09e111c7e1e7acb6f8cac0bb2fc4c8bc2ae3baaab9165cc458e199cc0d5fc2f4","note":"Block 4","previd":"00000000331ae5c93f9bf94c5b62bf7978b499549b8f6234d3b2743ffbd1bd58","txids":[],"type":"block"},"type":"object"}\n`
  );
  await delay(500);

  socket.write(
    `{"objectid":"00000000331ae5c93f9bf94c5b62bf7978b499549b8f6234d3b2743ffbd1bd58","type":"getobject"}\n`
  );
  console.log(
    `Should receive:         {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671212387,"miner":"grader","nonce":"b1acf38984b35ae882809dd4cfe7abc5c61baa52e053b4c3643f204f5d92de8e","note":"Block 3","previd":"0000000046fb03c2fcc7da4c5c1b208d64ec985595d14f60b669b106f5c3b8e7","txids":[],"type":"block"},"type":"object"}\n`
  );
  await delay(500);

  socket.write(
    `{"objectid":"0000000046fb03c2fcc7da4c5c1b208d64ec985595d14f60b669b106f5c3b8e7","type":"getobject"}\n`
  );
  console.log(
    `Should receive:         {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671168572,"miner":"grader","nonce":"e51c9737903343947e02086541e4c48a99630aa9aece153843a4b190a053d95c","note":"Block 2","previd":"000000000f007c87b4924c8c9668c6bb10eaa8422daa4baa6eff766e114eb331","txids":[],"type":"block"},"type":"object"}\n`
  );
  await delay(500);

  socket.write(
    `{"objectid":"000000000f007c87b4924c8c9668c6bb10eaa8422daa4baa6eff766e114eb331","type":"getobject"}\n`
  );
  console.log(
    `Should receive:         {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671093685,"miner":"grader","nonce":"5f7091a5abb0874df3e8cb4543a5eb93b0441e9ca4c2b0fb3d30875ce1504ce5","note":"Block 1","previd":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","txids":[],"type":"block"},"type":"object"}\n`
  );
  await delay(500);

  socket.write(
    `{"objectid":"0000000052a0e645eca917ae1c196e0d0a4fb756747f29ef52594d68484bb5e2","type":"getobject"}\n`
  );
  console.log(
    `Should receive:         {"object":{"T":"00000000abc00000000000000000000000000000000000000000000000000000","created":1671062400,"miner":"Marabu","nonce":"000000000000000000000000000000000000000000000000000000021bea03ed","note":"The New York Times 2022-12-13: Scientists Achieve Nuclear Fusion Breakthrough With Blast of 192 Lasers","previd":null,"txids":[],"type":"block"},"type":"object"}\n`
  );
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
