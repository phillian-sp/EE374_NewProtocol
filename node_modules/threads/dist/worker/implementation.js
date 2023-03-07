"use strict";
// tslint:disable no-var-requires
/*
 * This file is only a stub to make './implementation' resolve to the right module.
 */
Object.defineProperty(exports, "__esModule", { value: true });
function selectNodeImplementation() {
    try {
        return require("./implementation.worker_threads").default;
    }
    catch (error) {
        return require("./implementation.tiny-worker").default;
    }
}
exports.default = typeof process !== 'undefined' && process.arch !== 'browser' && 'pid' in process
    ? selectNodeImplementation()
    : require('./implementation.browser').default;
