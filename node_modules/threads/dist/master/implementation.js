"use strict";
// tslint:disable no-var-requires
/*
 * This file is only a stub to make './implementation' resolve to the right module.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = typeof process !== 'undefined' && process.arch !== 'browser' && 'pid' in process
    ? require('./implementation.node').default
    : require('./implementation.browser').default;
