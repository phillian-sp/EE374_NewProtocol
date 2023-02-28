import { logger } from "./logger";
import { MessageSocket } from "./network";
import semver from "semver";
import {
  Messages,
  Message,
  HelloMessage,
  PeersMessage,
  MempoolMessage,
  ChaintipMessage,
  GetPeersMessage,
  GetMempoolMessage,
  GetChaintipMessage,
  IHaveObjectMessage,
  GetObjectMessage,
  ObjectMessage,
  ErrorMessage,
  MessageType,
  HelloMessageType,
  PeersMessageType,
  ChaintipMessageType,
  GetPeersMessageType,
  GetChaintipMessageType,
  IHaveObjectMessageType,
  GetObjectMessageType,
  ObjectMessageType,
  ErrorMessageType,
  GetMempoolMessageType,
  MempoolMessageType,
  AnnotatedError,
} from "./message";
import { peerManager } from "./peermanager";
import { chaintipManager } from "./chaintipmanager";
import { canonicalize } from "json-canonicalize";
import { db, objectManager } from "./object";
import { network } from "./network";
import { ObjectId } from "./object";
import { Block } from "./block";
import { Transaction } from "./transaction";
import { Mempool } from "./mempool";

const VERSION = "0.9.0";
const NAME = "Malibu (pset3)";

// Number of peers that each peer is allowed to report to us
const MAX_PEERS_PER_PEER = 30;

export class Peer {
  active: boolean = false;
  socket: MessageSocket;
  handshakeCompleted: boolean = false;
  peerAddr: string;

  async sendHello() {
    this.sendMessage({
      type: "hello",
      version: VERSION,
      agent: NAME,
    });
  }
  async sendGetPeers() {
    this.sendMessage({
      type: "getpeers",
    });
  }
  async sendPeers() {
    this.sendMessage({
      type: "peers",
      peers: [...peerManager.knownPeers],
    });
  }
  async sendGetMempool() {
    this.sendMessage({
      type: "getmempool",
    })
  }
  async sendGetChaintip() {
    this.sendMessage({ type: "getchaintip" });
  }
  async sendChaintip() {
    this.sendMessage({ type: "chaintip", blockid: chaintipManager.blockid });
  }

  async sendIHaveObject(obj: any) {
    this.sendMessage({
      type: "ihaveobject",
      objectid: objectManager.id(obj),
    });
  }
  async sendObject(obj: any) {
    this.sendMessage({
      type: "object",
      object: obj,
    });
  }
  async sendMempool(txids: any) {
    this.sendMessage({
      type: "mempool",
      txids: txids,
    });
  }
  async sendGetObject(objid: ObjectId) {
    this.sendMessage({
      type: "getobject",
      objectid: objid,
    });
  }
  async sendError(err: AnnotatedError) {
    try {
      this.sendMessage(err.getJSON());
    } catch (error) {
      this.sendMessage(
        new AnnotatedError(
          "INTERNAL_ERROR",
          `Failed to serialize error message: ${error}`
        ).getJSON()
      );
    }
  }
  sendMessage(obj: object) {
    const message: string = canonicalize(obj);

    this.debug(`Sending message: ${message}`);
    this.socket.sendMessage(message);
  }
  /**
   * fatalError is called when a peer sends us a message that we cannot
   * parse, or when we encounter an internal error. We send the error
   * message to the peer, and then close the connection.
   *
   * @param err the error to send to the peer
   */
  async fatalError(err: AnnotatedError) {
    await this.sendError(err);
    this.warn(`Peer error: ${err}`);
    this.fail();
  }
  async fail() {
    this.active = false;
    this.socket.end();
    peerManager.peerFailed(this.peerAddr);
  }
  /**
   * Called when a peer connects to us
   */
  async onConnect() {
    this.active = true;
    await this.sendHello();
    await this.sendGetPeers();
    await this.sendGetChaintip();
    await this.sendGetMempool();
  }
  /**
   * Called when a peer does not send us an complete message within
   * a certain amount of time. We close the connection.
   *
   * @returns a promise that resolves when the connection is closed
   */
  async onTimeout() {
    // QUESTION: Why we need to return a promise here?
    return await this.fatalError(
      new AnnotatedError(
        "INVALID_FORMAT",
        "Timed out before message was complete"
      )
    );
  }
  async onMessage(message: string) {
    this.debug(`Message arrival: ${message}`);

    let msg: object;

    try {
      msg = JSON.parse(message);
      this.debug(`Parsed message into: ${JSON.stringify(msg)}`);
    } catch {
      return await this.fatalError(
        new AnnotatedError(
          "INVALID_FORMAT",
          `Failed to parse incoming message as JSON: ${message}`
        )
      );
    }
    if (!Message.guard(msg)) {
      const validation = Message.validate(msg);
      return await this.fatalError(
        new AnnotatedError(
          "INVALID_FORMAT",
          `The received message does not match one of the known message formats: ${message}
         Validation error: ${JSON.stringify(validation)}`
        )
      );
    }
    if (!this.handshakeCompleted) {
      if (HelloMessage.guard(msg)) {
        return this.onMessageHello(msg);
      }
      return await this.fatalError(
        new AnnotatedError(
          "INVALID_HANDSHAKE",
          `Received message ${message} prior to "hello"`
        )
      );
    }
    Message.match(
      async () => {
        return await this.fatalError(
          new AnnotatedError(
            "INVALID_HANDSHAKE",
            `Received a second "hello" message, even though handshake is completed`
          )
        );
      },
      this.onMessageGetPeers.bind(this),
      this.onMessagePeers.bind(this),
      this.onMessageIHaveObject.bind(this),
      this.onMessageGetObject.bind(this),
      this.onMessageObject.bind(this),
      this.onMessageError.bind(this),
      this.OnMessageChaintip.bind(this),
      this.OnMessageGetChaintip.bind(this),
      this.onMessageGetMempool.bind(this),
      this.onMessageMempool.bind(this)
      
    )(msg);
  }
  async onMessageHello(msg: HelloMessageType) {
    if (!semver.satisfies(msg.version, `^${VERSION}`)) {
      return await this.fatalError(
        new AnnotatedError(
          "INVALID_FORMAT",
          `You sent an incorrect version (${msg.version}), which is not compatible with this node's version ${VERSION}.`
        )
      );
    }
    this.info(
      `Handshake completed. Remote peer running ${msg.agent} at protocol version ${msg.version}`
    );
    this.handshakeCompleted = true;
  }
  
  async onMessagePeers(msg: PeersMessageType) {
    for (const peer of msg.peers.slice(0, MAX_PEERS_PER_PEER)) {
      this.info(`Remote party reports knowledge of peer ${peer}`);

      peerManager.peerDiscovered(peer);
    }
    if (msg.peers.length > MAX_PEERS_PER_PEER) {
      this.info(
        `Remote party reported ${msg.peers.length} peers, but we processed only ${MAX_PEERS_PER_PEER} of them.`
      );
    }
  }

  async OnMessageChaintip(msg: ChaintipMessageType) {
    this.info(`Peer claims chaintip: ${msg.blockid}`);

    if (!(await db.exists(msg.blockid))) {
      this.info(`Object ${msg.blockid} discovered`);
      await this.sendGetObject(msg.blockid);
    }
  }

  async onMessageGetPeers(msg: GetPeersMessageType) {
    this.info(`Remote party is requesting peers. Sharing.`);
    await this.sendPeers();
  }

  async OnMessageGetChaintip(msg: GetChaintipMessageType) {
    this.info(`Remote party is requesting chaintip. Sharing`);
    await this.sendChaintip();
  }

  async onMessageIHaveObject(msg: IHaveObjectMessageType) {
    this.info(`Peer claims knowledge of: ${msg.objectid}`);

    if (!(await db.exists(msg.objectid))) {
      this.info(`Object ${msg.objectid} discovered`);
      await this.sendGetObject(msg.objectid);
    }
  }

  async onMessageGetObject(msg: GetObjectMessageType) {
    this.info(`Peer requested object with id: ${msg.objectid}`);

    let obj;
    try {
      obj = await objectManager.get(msg.objectid);
    } catch (e) {
      this.warn(`We don't have the requested object with id: ${msg.objectid}`);
      this.sendError(
        new AnnotatedError(
          "UNKNOWN_OBJECT",
          `Unknown object with id ${msg.objectid}`
        )
      );
      return;
    }
    await this.sendObject(obj);
  }

  async onMessageGetMempool(msg: GetMempoolMessageType) {
    this.info(`Peer requested mempool`);

    // TODO
  }

  async onMessageMempool(msg: MempoolMessageType) {
    this.info(`Peer sent mempool`);

    msg.txids.forEach(async (txid) => {
      await this.sendGetObject(txid); 
    }); 
  }

  /**
   * Called when a peer sends us an object. We store it in the database,
   * and then validate it. If it is valid, we gossip it to our peers.
   *
   * @param msg message containing the object
   */
  async onMessageObject(msg: ObjectMessageType) {
    const objectid: ObjectId = objectManager.id(msg.object);
    let known: boolean = false;

    this.info(`Received object with id ${objectid}: %o`, msg.object);

    known = await objectManager.exists(objectid);

    if (known) {
      this.debug(`Object with id ${objectid} is already known`);
    } else {
      this.info(`New object with id ${objectid} downloaded: %o`, msg.object);

      // store object even if it is invalid
      await objectManager.put(msg.object);
    }

    // validate object
    // if it is invalid, we will send an error message to the peer
    let instance: Block | Transaction;
    try {
      instance = await objectManager.validate(msg.object, this);
    } catch (e: any) {
      this.sendError(e);
      return;
    }

    if (!known) {
      // add to our own mempool
      if (instance instanceof Transaction) {
        await Mempool.apply(instance);
      }
      
      // gossip
      network.broadcast({
        type: "ihaveobject",
        objectid,
      });
    }
  }
  /**
   * Called when the peer reports an error
   *
   * @param msg the error message
   */
  async onMessageError(msg: ErrorMessageType) {
    this.warn(`Peer reported error: ${msg.name}`);
  }
  /**
   * the function to log messages with the peer's address
   *
   * @param level the log level
   * @param message message to log
   * @param args additional arguments to log
   */
  log(level: string, message: string, ...args: any[]) {
    logger.log(
      level,
      `[peer ${this.socket.peerAddr}:${this.socket.netSocket.remotePort}] ${message}`,
      ...args
    );
  }
  warn(message: string, ...args: any[]) {
    this.log("warn", message, ...args);
  }
  info(message: string, ...args: any[]) {
    this.log("info", message, ...args);
  }
  debug(message: string, ...args: any[]) {
    this.log("debug", message, ...args);
  }
  constructor(socket: MessageSocket, peerAddr: string) {
    this.socket = socket;
    this.peerAddr = peerAddr;

    socket.netSocket.on("connect", this.onConnect.bind(this));
    socket.netSocket.on("error", (err) => {
      this.warn(`Socket error: ${err}`);
      this.fail();
    });
    socket.on("message", this.onMessage.bind(this));
    socket.on("timeout", this.onTimeout.bind(this));
  }
}
