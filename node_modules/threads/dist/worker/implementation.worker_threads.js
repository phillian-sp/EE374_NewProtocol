"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const WorkerThreads = __importStar(require("../worker_threads"));
function assertMessagePort(port) {
    if (!port) {
        throw Error("Invariant violation: MessagePort to parent is not available.");
    }
    return port;
}
const isWorkerRuntime = function isWorkerRuntime() {
    return !WorkerThreads.isMainThread;
};
const postMessageToMaster = function postMessageToMaster(data, transferList) {
    assertMessagePort(WorkerThreads.parentPort).postMessage(data, transferList);
};
const subscribeToMasterMessages = function subscribeToMasterMessages(onMessage) {
    if (!WorkerThreads.parentPort) {
        throw Error("Invariant violation: MessagePort to parent is not available.");
    }
    const messageHandler = (message) => {
        onMessage(message);
    };
    const unsubscribe = () => {
        assertMessagePort(WorkerThreads.parentPort).off("message", messageHandler);
    };
    assertMessagePort(WorkerThreads.parentPort).on("message", messageHandler);
    return unsubscribe;
};
exports.default = {
    isWorkerRuntime,
    postMessageToMaster,
    subscribeToMasterMessages
};
