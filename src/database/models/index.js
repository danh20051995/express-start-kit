import fs from 'fs'
import path from 'path'
import Sequelize from 'sequelize'
import dbConfig from '../config'
import { injectHooks } from '@/database/custom/hooks'
import { injectMethods } from '@/database/custom/methods'
import { injectStatics } from '@/database/custom/statics'

const basename = path.basename(__filename)
const envConfig = dbConfig.get(process.env.NODE_ENV)
const sequelize = new Sequelize(envConfig.url, envConfig)

/**
 * Convert string to pascal case
 * @returns {string}
 */
const pascalCase = str => String(str)
  // Replaces any - or _ characters with a space
  .replace(/[-_]+/g, ' ')
  // Removes any non alphanumeric characters
  .replace(/[^\w\s]/g, '')
  // Uppercase the first character in each group immediately following a space
  // (delimited by spaces)
  .replace(
    /\s+(.)(\w+)/g,
    ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
  )
  // Removes spaces
  .replace(/\s/g, '')
  // Uppercase first letter
  .replace(/\w/, s => s.toUpperCase())

// hooks fix count wrong when include M:N associations
sequelize.addHook('beforeCount', function (options) {
  if (this._scope.include && this._scope.include.length > 0) {
    options.distinct = true
    options.col = this._scope.col || options.col || `"${this.options.name.singular}".id`
  }

  if (options.include && options.include.length > 0) {
    options.include = null
  }
})

;(function tryConnect (count = 0) {
  sequelize
    .authenticate()
    .then(() => {
      console.log('Database connection has been established successfully.')
    })
    .catch(error => {
      console.log(`Unable to connect to the database (${count}): `, error)
      setTimeout(() => {
        tryConnect(++count)
      }, Math.max(count * 500, 5000))
    })
})()

/**
 * @returns {{ [key in string]: import('sequelize/lib/model') }}
 */
const loadModels = () => {
  const models = {}

  for (const file of fs.readdirSync(__dirname)) {
    if ((file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')) {
      const modelName = pascalCase(path.basename(file, 'js'))
      const model = require(path.join(__dirname, file))(sequelize, Sequelize)
      injectHooks(model)
      injectStatics(model)
      injectMethods(model)
      models[modelName] = model
    }
  }

  for (const modelName of Object.keys(models)) {
    models[`${modelName}Model`] = models[modelName]
    if (models[modelName].associate) {
      models[modelName].associate(models)
    }
  }

  return models
}

module.exports = loadModels()
