import mongooseToSwagger from 'mongoose-to-swagger'
import { isMongooseModel, isSequelizeModel } from './util'

const mapSequelizeToSwaggerDataType = (sequelizeType) => {
  const mapper = (key) => {
    switch (key) {
      case 'UUID': return { type: 'string', format: 'uuid' }
      case 'STRING':
      case 'TEXT': return { type: 'string' }
      case 'DATEONLY': return { type: 'string', format: 'date' }
      case 'DATE': return { type: 'string', format: 'date-time' }
      case 'BOOLEAN': return { type: 'boolean' }
      case 'DOUBLE PRECISION': return { type: 'number', format: 'double' }
      case 'BIGINT': return { type: 'number', format: 'int64' }
      case 'ENUM': return { type: 'string', enum: sequelizeType.values }
      case 'ARRAY': return { type: 'array', items: mapSequelizeToSwaggerDataType(sequelizeType.type) }
      default: return { type: key }
    }
  }

  return mapper(sequelizeType.key)
}

const convertSequelizeModelToSwaggerSchema = (model) => {
  const name = model.tableName
  const fieldNames = Object.keys(model.rawAttributes)
  const properties = fieldNames.reduce((props, fieldName) => ({
    ...props,
    [fieldName]: {
      ...mapSequelizeToSwaggerDataType(model.rawAttributes[fieldName].type)
    }
  }), {})

  return {
    [name]: {
      type: 'object',
      properties
    }
  }
}

const convertMongooseModelToSwaggerSchema = (model) => {
  const { title: name, properties } = mongooseToSwagger(model)

  return {
    [name]: {
      type: 'object',
      properties
    }
  }
}

const convertModelToSwaggerSchema = (model) => {
  if (isSequelizeModel(model)) {
    return convertSequelizeModelToSwaggerSchema(model)
  }
  if (isMongooseModel(model)) {
    return convertMongooseModelToSwaggerSchema(model)
  }

  console.warn('Arguments[0] must be a model')

  return {}
}

/**
 * @returns {object}
 */
export const convertModelsToSwaggerSchemas = (models) => {
  const schemas = Object
    .entries(models)
    .map(([_, model]) => convertModelToSwaggerSchema(model))

  return schemas.reduce(
    (result, schema) => ({
      ...result,
      ...schema
    }),
    {}
  )
}
