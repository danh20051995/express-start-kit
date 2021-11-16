import { HTTP } from '@/bootstrap/kernel/http'
import bytes from 'bytes'

/**
 * @param {object} options
 * @param {bytes.Unit|undefined} options.limit
 */
export const sizeLimitMiddleware = (options = { limit: '100kb' }) => {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  return (req, res, next) => {
    const limit = bytes.parse(options.limit)
    const length = Number(req.headers['content-length'])

    if (length > limit) {
      return res.status(HTTP._CODE.PAYLOAD_TOO_LARGE).end()
    }

    next()
  }
}
