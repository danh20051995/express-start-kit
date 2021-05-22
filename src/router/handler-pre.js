/**
 * single pre router handler
 * @param {Function} fn
 * @returns {Promise<void>}
 */
const singleHandler = async (fn, req, res, next) => {
  const _fn = fn.method || fn
  const _preValue = await _fn(req, res)
  if (fn.assign) {
    req.pre[fn.assign] = _preValue
  }
}

/**
 * parallel pre router handler
 * @param {Function} fn
 * @returns {Promise<void>}
 */
const parallelHandler = (fns, req, res, next) => Promise.all(
  fns.map(
    fn => singleHandler(fn, req, res, next)
  )
)

const handler = async (preRouter, req, res, next) => {
  req.pre = { ...req.pre }

  for (const _preItem of preRouter) {
    if (Array.isArray(_preItem)) {
      await parallelHandler(_preItem, req, res, next)
    } else {
      await singleHandler(_preItem, req, res, next)
    }
  }
}

/**
 * Router pre-handler middleware
 */
export const handlerPreRouter = preRouter => {
  return (req, res, next) => {
    return handler(preRouter, req, res, next)
      .then(next)
      .catch(next)
  }
}
