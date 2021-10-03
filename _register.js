require('dotenv').config()
require('@babel/register')

// require('module-alias/register')
const path = require('path')
require('module-alias').addAliases({
  '@': path.join(__dirname, '/src')
})

/**
 * START: global
 */
global.BASE_PATH = __dirname
global.REGISTERED = true
/**
 * END: global
 */

/**
 * START: process
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

/** Handle process events */
process.on('uncaughtException', (error, origin) => {
  const message = [
    `Exception origin: ${origin}`,
    // `${error.message}`,
    error.stack
  ].join('\n')

  console.log(message)
})

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at ', promise, 'with reason ', reason)
})

process.on('rejectionHandled', promise => {
  console.log('Rejection Handled at ', promise)
})

// // Exit handler
// // Catches ctrl+c event
// process.on('SIGINT', () => {
//   console.log('Received SIGINT. Press Control-C to exit.')
// })

// // Do something when app is closing
// process.on('exit', (code) => {
//   console.log(`Process exit with code: ${code}`)
// })

/**
 * Check current process NODE_ENV
 */
const envIs = env => process.env.NODE_ENV === env
process.envIs = envIs
process.isDev = process.isDevelopment = envIs('development')
process.isStag = process.isStaging = envIs('staging')
process.isProd = process.isProduction = envIs('production')
process.notProd = process.notProduction = function notProduction (callback) {
  return typeof callback === 'function' && !process.isProd && callback()
}
/**
 * END: process
 */

/** polyfill */
require('@/polyfill')

/** config */
require('@/config')
