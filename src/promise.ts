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
export class Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void = () => {}
  reject: (reason?: any) => void = () => {}

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }
}

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
export function delay(ms: number) {
  const deferred = new Deferred<void>()

  setTimeout(() => deferred.resolve(), ms)
  return deferred.promise
}

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
export function resolveToReject(promise: Promise<any>, reason: string): Promise<never> {
  const deferred = new Deferred<never>()

  promise.then(() => {
    deferred.reject(new Error(reason))
  })
  promise.catch(() => {
    deferred.reject(new Error(reason))
  })

  return deferred.promise
}
