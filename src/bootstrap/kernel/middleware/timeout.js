import { HTTP } from '../http'

/**
 * @param {number} connectionTimeout
 */
export const timeoutMiddleware = connectionTimeout => {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  return (req, res, next) => {
    if (!connectionTimeout) {
      return next()
    }

    const timeoutTimer = connectionTimeout && setTimeout(
      () => res.status(HTTP._CODE.REQUEST_TIMEOUT).end(),
      connectionTimeout
    )

    res.on('finish', function clearTimeoutTimer () {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer)
      }
    })

    // Events fire by order
    // res.on('finish', () => console.log('res.finish'))
    // res.on('close', () => console.log('res.close'))
    // req.on('end', () => console.log('req.end'))
    // req.on('close', () => console.log('req.close'))

    next()
  }
}
