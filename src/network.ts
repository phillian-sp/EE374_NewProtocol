import * as net from "net";
import { logger } from "./logger";
import { Peer } from "./peer";
import { EventEmitter } from "events";
import { peerManager } from "./peermanager";
import { chaintipManager } from "./chaintipmanager";
import { delay } from "./promise";
import { validRange } from "semver";

const TIMEOUT_DELAY = 10000; // 10 seconds
const MAX_BUFFER_SIZE = 100 * 1024; // 100 kB

class Network {
  peers: Peer[] = [];

  async init(bindPort: number, bindIP: string) {
    await peerManager.load();
    await chaintipManager.load();

    const server = net.createServer((socket) => {
      logger.info(`New connection from peer ${socket.remoteAddress}`);
      const peer = new Peer(
        new MessageSocket(
          socket,
          `${socket.remoteAddress}:${socket.remotePort}`
        ),
        `${socket.remoteAddress}:${socket.remotePort}`
      );
      this.peers.push(peer);
      peer.onConnect();
    });

    logger.info(
      `Listening for connections on port ${bindPort} and IP ${bindIP}`
    );
    server.listen(bindPort, bindIP);
    var b: boolean = false;
    for (const peerAddr of peerManager.knownPeers) {
      logger.info(`Attempting connection to known peer ${peerAddr}`);
      try {
        const peer = new Peer(MessageSocket.createClient(peerAddr), peerAddr);
        //DELETE AFTER TESTING
        // if (!b) {
        // await delay(500);
        // peer.socket.netSocket.write(
        //   `{"objectid":"17a497c5e14bc2277d142bc0677c2a70d5452ec78fe7c1279cba1837f854bde1","type":"getobject"}\n`
        // );
        // peer.socket.netSocket.write(
        //   `{"objectid":"549d3f85cdf6c7abfaee5ea962a65148ee79e54f491d42f233fc7be80217fa39","type":"getobject"}\n`
        // );
        // peer.socket.netSocket.write(
        //   `{"objectid":"5b3a28a26992097c733b24ae9abe6788dda2cc005897c4e746e1985c138edc74","type":"getobject"}\n`
        // );

        // peer.socket.netSocket.write(
        //   `{"objectid":"058d7388dc7410baacf71112bc3b1c2820c9c329edf6397093647c601ff84777","type":"getobject"}\n`
        // );
        // peer.socket.netSocket.write(
        //   `{"objectid":"36e2f567d8a144ae8cd55fffae636d747c7d1ed77f965c2ba7d5036f63c017dd","type":"getobject"}\n`
        // );
        // peer.socket.netSocket.write(
        //   `{"objectid":"8790187596c417cc41fe632bb1eaa779e0529dc256a37df9c531d012198a0b18","type":"getobject"}\n`
        // );

        //   b = true;
        // }

        this.peers.push(peer);
      } catch (e: any) {
        logger.warn(
          `Failed to create connection to peer ${peerAddr}: ${e.message}`
        );
      }
    }
  }
  broadcast(obj: object) {
    logger.info(`Broadcasting object to all peers: %o`, obj);

    for (const peer of this.peers) {
      if (peer.active) {
        peer.sendMessage(obj); // intentionally delayed
      }
    }
  }
}

export class MessageSocket extends EventEmitter {
  buffer: string = ""; // defragmentation buffer
  netSocket: net.Socket;
  peerAddr: string;
  timeout: NodeJS.Timeout | undefined;

  static createClient(peerAddr: string) {
    const [host, portStr] = peerAddr.split(":");
    const port = +portStr;
    if (port < 0 || port > 65535) {
      throw new Error("Invalid port");
    }
    const netSocket = new net.Socket();
    const socket = new MessageSocket(netSocket, peerAddr);

    netSocket.connect(port, host);

    return socket;
  }
  constructor(netSocket: net.Socket, peerAddr: string) {
    super();

    this.peerAddr = peerAddr;
    this.netSocket = netSocket;

    // called when data is received
    this.netSocket.on("data", (data: string) => {
      if (this.buffer.length > MAX_BUFFER_SIZE) {
        this.emit("timeout");
        return;
      }

      this.buffer += data;
      const messages = this.buffer.split("\n");

      if (messages.length > 1) {
        for (const message of messages.slice(0, -1)) {
          this.emit("message", message);
          if (this.timeout) clearTimeout(this.timeout);
        }
        this.buffer = messages[messages.length - 1];
      }

      if (!this.timeout && this.buffer.length > 0) {
        this.timeout = setTimeout(() => {
          this.emit("timeout");
        }, TIMEOUT_DELAY);
      }
    });
  }
  sendMessage(message: string) {
    this.netSocket.write(`${message}\n`);
  }
  end() {
    this.netSocket.end();
  }
}

export const network = new Network();
