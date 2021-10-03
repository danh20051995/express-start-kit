import http from 'http'

export const handlerException = handler => {
  if (typeof handler !== 'function') {
    throw new Error('handler must be a function')
  }

  return (req, res, next) => {
    const handlerResponse = data => {
      if (res.headersSent || res.writableEnded || res.writableFinished || data instanceof http.ServerResponse) {
        return
      }

      if (data) {
        const statusCode = res.statusCode !== 200
          ? res.statusCode
          : 200
        return res
          .status(statusCode)
          .send(data)
      }

      if (typeof data !== 'undefined') {
        return res
          .status(204)
          .end()
      }
    }

    const result = handler(req, res, next)

    if (result instanceof Promise) {
      return result
        .then(handlerResponse)
        .catch((error) => next(error))
    }

    return handlerResponse(result)
  }
}
