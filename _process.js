process.env.NODE_ENV = process.env.NODE_ENV || 'development'

/** Handle process events */
process.on('uncaughtException', error => {
  console.log('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at ', promise, 'with reason ', reason)
})

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
