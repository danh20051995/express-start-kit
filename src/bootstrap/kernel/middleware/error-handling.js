import upperCase from 'lodash/upperCase'
import { HTTP } from '../http'

/**
 * Catch 404
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {NextFunction} next
 * @returns {Response}
 */
export const notFoundHandler = (req, res, next) => {
  const error = new HTTP(HTTP._CODE.NOT_FOUND, `Unknown path components: ${req.URL.pathname}`)
  return res
    .status(error.statusCode)
    .json(error.toObject())
}

/**
 * Error handler. Capture stack trace only during development
 * @param {HTTP} error
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {NextFunction} next
 * @returns {Response}
 */
export const errorHandler = (error, req, res, next) => {
  /* create error log */
  console.log(`========== ${upperCase(req.method)} | ${req.URL?.pathname} ==========`)
  console.log(error)

  if (process.isProd && !(error instanceof HTTP)) {
    error = new HTTP(HTTP._CODE.BAD_REQUEST, error.message)
  }

  return res
    .status(error.statusCode || HTTP._CODE.BAD_REQUEST)
    .json(
      error.toObject
        ? error.toObject()
        : {
          message: error.message,
          stack: error.stack
        }
    )
}

export default {
  notFoundHandler,
  errorHandler
}
