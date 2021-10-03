/**
 * Promise.settled polyfill
 * @param {(resolve: (value: any) => void, reject: (reason?: any) => void) => void} executor
 */
export const settled = (executor) => {
  return (new Promise(executor))
    .then((value) => ({
      status: 'fulfilled',
      value
    }))
    .catch((reason) => ({
      status: 'rejected',
      reason
    }))
}

if (!Promise.settled) {
  Promise.settled = settled
}
