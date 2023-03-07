"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function rehydrateError(error) {
    return Object.assign(Error(error.message), {
        name: error.name,
        stack: error.stack
    });
}
exports.rehydrateError = rehydrateError;
function serializeError(error) {
    return {
        message: error.message,
        name: error.name,
        stack: error.stack
    };
}
exports.serializeError = serializeError;
