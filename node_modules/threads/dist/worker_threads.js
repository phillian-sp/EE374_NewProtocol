"use strict";
// Webpack hack
// tslint:disable no-eval
Object.defineProperty(exports, "__esModule", { value: true });
const workerThreads = typeof __non_webpack_require__ === "function"
    ? __non_webpack_require__("worker_threads")
    : eval("require")("worker_threads");
exports.MessagePort = workerThreads.MessagePort;
exports.isMainThread = workerThreads.isMainThread;
exports.parentPort = workerThreads.parentPort;
