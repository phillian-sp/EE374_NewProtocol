"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.network = exports.MessageSocket = void 0;
const net = __importStar(require("net"));
const logger_1 = require("./logger");
const peer_1 = require("./peer");
const events_1 = require("events");
const peermanager_1 = require("./peermanager");
const chaintipmanager_1 = require("./chaintipmanager");
const TIMEOUT_DELAY = 10000; // 10 seconds
const MAX_BUFFER_SIZE = 100 * 1024; // 100 kB
class Network {
    constructor() {
        this.peers = [];
    }
    init(bindPort, bindIP) {
        return __awaiter(this, void 0, void 0, function* () {
            yield peermanager_1.peerManager.load();
            yield chaintipmanager_1.chaintipManager.load();
            const server = net.createServer((socket) => {
                logger_1.logger.info(`New connection from peer ${socket.remoteAddress}`);
                const peer = new peer_1.Peer(new MessageSocket(socket, `${socket.remoteAddress}:${socket.remotePort}`), `${socket.remoteAddress}:${socket.remotePort}`);
                this.peers.push(peer);
                peer.onConnect();
            });
            logger_1.logger.info(`Listening for connections on port ${bindPort} and IP ${bindIP}`);
            server.listen(bindPort, bindIP);
            var b = false;
            for (const peerAddr of peermanager_1.peerManager.knownPeers) {
                logger_1.logger.info(`Attempting connection to known peer ${peerAddr}`);
                try {
                    const peer = new peer_1.Peer(MessageSocket.createClient(peerAddr), peerAddr);
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
                }
                catch (e) {
                    logger_1.logger.warn(`Failed to create connection to peer ${peerAddr}: ${e.message}`);
                }
            }
        });
    }
    broadcast(obj) {
        logger_1.logger.info(`Broadcasting object to all peers: %o`, obj);
        for (const peer of this.peers) {
            if (peer.active) {
                peer.sendMessage(obj); // intentionally delayed
            }
        }
    }
}
class MessageSocket extends events_1.EventEmitter {
    static createClient(peerAddr) {
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
    constructor(netSocket, peerAddr) {
        super();
        this.buffer = ""; // defragmentation buffer
        this.peerAddr = peerAddr;
        this.netSocket = netSocket;
        // called when data is received
        this.netSocket.on("data", (data) => {
            if (this.buffer.length > MAX_BUFFER_SIZE) {
                this.emit("timeout");
                return;
            }
            this.buffer += data;
            const messages = this.buffer.split("\n");
            if (messages.length > 1) {
                for (const message of messages.slice(0, -1)) {
                    this.emit("message", message);
                    if (this.timeout)
                        clearTimeout(this.timeout);
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
    sendMessage(message) {
        this.netSocket.write(`${message}\n`);
    }
    end() {
        this.netSocket.end();
    }
}
exports.MessageSocket = MessageSocket;
exports.network = new Network();
