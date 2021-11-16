/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const injectURLMiddleware = (req, res, next) => {
  const _PATHNAME = req.originalUrl.split('?').shift()
  const _URL = req.protocol + '://' + req.get('host') + _PATHNAME
  req._URL = _URL

  const _URI = req.protocol + '://' + req.get('host') + req.originalUrl
  req._URI = _URI

  req.URL = new URL(_URI)

  next()
}
