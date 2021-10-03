import upperCase from 'lodash/upperCase'

/**
 * Add padding spacing to string by length
 * @param {string} str
 * @param {number} length
 * @returns {string}
 */
const spacingWrap = (str, length = 10) => {
  if (str.length >= length) {
    return str
  }

  return `${str}${new Array(length - str.length).join(' ')}`
}

export const responseTimeLogger = (req, res, next) => {
  // const _timestamp = new Date()
  // const _writeHead = res.writeHead
  // res.writeHead = function writeHead () {
  //   if (_timestamp) {
  //     const time = new Date() - _timestamp
  //     _timestamp = false
  //     console.log(
  //       [
  //         spacingWrap(upperCase(req.method), 7),
  //         res.statusCode,
  //         spacingWrap(`${time} ms`, 9),
  //         req.URL.pathname
  //       ].join(' | ')
  //     )
  //     // console.table({
  //     //   Method: upperCase(req.method),
  //     //   RequestUrl: req.URL.pathname,
  //     //   StatusCode: res.statusCode,
  //     //   ResponseTime: `${time} ms`
  //     // })
  //   }
  //   return _writeHead.apply(this, arguments)
  // }

  // const listenEvent = 'close' // finish|close
  // const _timestamp = new Date()
  // res.on(listenEvent, function timeLogger () {
  //   const time = new Date() - _timestamp
  //   console.log(
  //     [
  //       spacingWrap(listenEvent, 6),
  //       spacingWrap(upperCase(req.method), 7),
  //       res.statusCode,
  //       spacingWrap(`${time} ms`, 9),
  //       req.URL.pathname.replace(/\/$g/, '')
  //     ].join(' | ')
  //   )
  // })

  const listenEvent = 'end'
  const _timestamp = new Date()
  req.on(listenEvent, function timeLogger () {
    const time = new Date() - _timestamp
    console.log(
      [
        // spacingWrap(listenEvent, 6),
        spacingWrap(upperCase(req.method), 7),
        res.statusCode,
        spacingWrap(`${time} ms`, 9),
        req.URL.pathname.replace(/\/$g/, '')
      ].join(' | ')
    )
  })

  next()
}