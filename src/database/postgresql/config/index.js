if (!global.REGISTERED) {
  require('../../../../_register.js')
}

const { Config } = require('@/config')
const dbConfig = Config.get('db.postgresql')

module.exports = {
  development: {
    ...dbConfig
    // logging (...args) {
    //   console.log(args)
    // }
  },
  staging: {
    ...dbConfig,
    logging: false
  },
  production: {
    ...dbConfig,
    logging: false
  },
  get (env) {
    if (!['development', 'staging', 'production'].includes(env)) {
      throw new Error(`Invalid database config for env: ${env}`)
    }

    return this[env]
  }
}
