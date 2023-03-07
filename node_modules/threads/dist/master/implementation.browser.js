"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultPoolSize = navigator.hardwareConcurrency || 4;
function selectWorkerImplementation() {
    return Worker;
}
exports.default = {
    defaultPoolSize,
    selectWorkerImplementation
};
