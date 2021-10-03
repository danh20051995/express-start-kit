import Config from 'config'
import { HTTP } from '../http'

export const timeoutHandler = (req, res, next) => {
  const connectionTimeout = Config.get('connection.timeout')
  if (!connectionTimeout) {
    return next()
  }

  const timeoutTimer = connectionTimeout && setTimeout(() => {
    return res
      .status(HTTP._CODE.REQUEST_TIMEOUT)
      .end()
  }, connectionTimeout)
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
