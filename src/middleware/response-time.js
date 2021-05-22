import { upperCase } from 'lodash'

export const responseTimeLogger = (req, res, next) => {
  let _timestamp = new Date()
  const _writeHead = res.writeHead

  res.writeHead = function writeHead () {
    if (_timestamp) {
      const time = new Date() - _timestamp
      _timestamp = false
      console.log(`=== ${upperCase(req.method)} | ${req.originalUrl} | ${time} ms ===`)
    }
    return _writeHead.apply(this, arguments)
  }

  next()
}
