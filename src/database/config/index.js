const Config = require('config')
const dbConfig = Config.get('db')
const selectedDb = dbConfig[dbConfig.dialect]

module.exports = {
  development: {
    ...selectedDb,
    logging: false
    // logging (...args) {
    //   console.log(args)
    // }
  },
  staging: {
    ...selectedDb,
    logging: false
  },
  production: {
    ...selectedDb,
    logging: false
  },
  get (env) {
    if (!['development', 'staging', 'production'].includes(env)) {
      throw new Error(`Invalid database config for env: ${env}`)
    }

    return this[env]
  }
}
