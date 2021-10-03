/**
 * single layer handler
 * @param {Function} fn
 * @returns {Promise<void>}
 */
const singleHandler = async (fn, event, req, res, next) => {
  const _fn = fn.method || fn
  const _layerValue = await _fn(req, res, next)
  if (fn.assign) {
    req[event][fn.assign] = _layerValue
  }
}

/**
 * parallel layer handler
 * @param {Function} fn
 * @returns {Promise<void>}
 */
const parallelHandler = (fns, event, req, res, next) => Promise.all(
  fns.map(
    fn => singleHandler(fn, event, req, res, next)
  )
)

const layerHandler = async ({ layers, event }, req, res, next) => {
  req[event] = { ...req[event] }

  for (const _layerItem of layers) {
    if (Array.isArray(_layerItem)) {
      await parallelHandler(_layerItem, event, req, res, next)
    } else {
      await singleHandler(_layerItem, event, req, res, next)
    }
  }
}

/**
 * Router layer-handler middleware
 */
export const handlerRouteLayer = (layers, event) => {
  return (req, res, next) => {
    return layerHandler({ layers, event }, req, res, next)
      .then(next)
      .catch(next)
  }
}
