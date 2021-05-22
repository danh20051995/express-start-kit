import http from 'http'

export const handlerException = fn => {
  if (typeof fn !== 'function') {
    throw new Error('fn must be a function')
  }

  return (req, res, next) => {
    const handlerResponse = data => {
      if (data instanceof http.ServerResponse) {
        return
      }

      if (data && typeof data === 'object') {
        return res.json(data)
      }

      if (typeof data !== 'undefined' && !res.finished) {
        return res.send(data)
      }
    }

    const result = fn(req, res, next)

    if (result instanceof Promise) {
      return result
        .then(handlerResponse)
        .catch((error) => next(error))
    }

    return handlerResponse(result)
  }
}
