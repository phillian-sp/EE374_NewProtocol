"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveToReject = exports.delay = exports.Deferred = void 0;
/**
 * This class is used to create a promise that can be resolved or rejected
 * at a later time.
 *
 * @typeparam T the type of the value that the promise resolves to
 * @example
 * const deferred = new Deferred<number>()
 *
 * setTimeout(() => deferred.resolve(42), 1000)
 *
 * deferred.promise.then((value) => {
 *  console.log(value) // 42
 * })
 *
 * @example
 * const deferred = new Deferred<number>()
 *
 * setTimeout(() => deferred.reject(new Error('timeout')), 1000)
 *
 * deferred.promise.catch((error) => {
 *  console.log(error.message) // timeout
 * })
 */
class Deferred {
    constructor() {
        this.resolve = () => { };
        this.reject = () => { };
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}
exports.Deferred = Deferred;
/**
 * This function creates a promise that resolves after the specified number of
 * milliseconds.
 *
 * @param ms the number of milliseconds to delay
 * @returns  a promise that resolves after the specified number of milliseconds
 * @example
 * delay(1000).then(() => {
 *  console.log('1 second has passed')
 * })
 */
function delay(ms) {
    const deferred = new Deferred();
    setTimeout(() => deferred.resolve(), ms);
    return deferred.promise;
}
exports.delay = delay;
/**
 * This function creates a promise that resolves to a rejection after the
 * specified number of milliseconds.
 * @param promise promise to wait for
 * @param reason reason for the rejection
 * @returns a promise that resolves to a rejection after the specified number of milliseconds
 * @example
 * resolveToReject(delay(1000), 'timeout').catch((error) => {
 * console.log(error.message) // timeout
 * })
 */
function resolveToReject(promise, reason) {
    const deferred = new Deferred();
    promise.then(() => {
        deferred.reject(new Error(reason));
    });
    promise.catch(() => {
        deferred.reject(new Error(reason));
    });
    return deferred.promise;
}
exports.resolveToReject = resolveToReject;
