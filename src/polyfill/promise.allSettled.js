/**
 * Promise.allSettled polyfill
 * @param {Promise[]} promises
 */
export const allSettled = (promises) => {
  const mappedPromises = promises.map((p) => {
    return p
      .then((value) => {
        return {
          status: 'fulfilled',
          value
        }
      })
      .catch((reason) => {
        return {
          status: 'rejected',
          reason
        }
      })
  })

  return Promise.all(mappedPromises)
}

if (!Promise.allSettled) {
  Promise.allSettled = allSettled
}
