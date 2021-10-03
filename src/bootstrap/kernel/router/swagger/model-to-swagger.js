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

/**
 * @param {{ name: string; model: import('sequelize').Model }} param
 */
const sequelizeModelToSchema = ({ name, model }) => {
  const fieldNames = Object.keys(model.rawAttributes)
  const properties = fieldNames.reduce((props, fieldName) => {
    return {
      ...props,
      [fieldName]: {
        ...mapSequelizeToSwaggerDataType(model.rawAttributes[fieldName].type)
      }
    }
  }, {})

  return {
    [name]: {
      type: 'object',
      properties
    }
  }
}

/**
 * @param {{ [key in string]: import('sequelize').Model }} models
 * @returns {object}
 */
export const sequelizeModelsToSchemas = (models) => {
  const schemas = Object.entries(models)
    .filter(([modelName]) => !modelName.endsWith('Model'))
    .map(([_, model]) => sequelizeModelToSchema({ name: model.tableName, model }))

  return schemas.reduce(
    (result, schema) => ({
      ...result,
      ...schema
    }),
    {}
  )
}
