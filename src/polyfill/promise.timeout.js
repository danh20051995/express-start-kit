/**
 * Promise.timeout polyfill
 * @param {Promise} promise
 * @param {number} time
 * @returns {Promise}
 */
export const timeout = (promise, time) => Promise.race([
  promise,
  new Promise((resolve, reject) => setTimeout(reject, time))
])

if (!Promise.timeout) {
  Promise.timeout = timeout
}
