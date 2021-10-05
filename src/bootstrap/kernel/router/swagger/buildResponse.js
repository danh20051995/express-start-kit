import mongoose from 'mongoose'
import { HTTP } from '@/bootstrap/kernel/http'
import { uniqKeepLast } from '@/utils/array'

const mimeType = {
  json: 'application/json'
}

export const isSequelizeModel = Model => {
  if (!Model || !Model.tableName || typeof Model.tableName !== 'string' || !Model.queryInterface?.sequelize) {
    return false
  }

  return true
}

export const isMongooseModel = Model => {
  return Model.prototype instanceof mongoose.Model
}

const mapModelNameToSwaggerSchemaPath = Model => {
  return `#/components/schemas/${Model.tableName || Model.modelName}`
}

function replaceRefModelBySchema (schema = {}) {
  if (!schema) {
    return schema
  }

  if (isSequelizeModel(schema)) {
    return { $ref: mapModelNameToSwaggerSchemaPath(schema) }
  }

  if (isMongooseModel(schema)) {
    return { $ref: mapModelNameToSwaggerSchemaPath(schema) }
  }

  for (const key of Object.keys(schema)) {
    if (key === '$ref' || isSequelizeModel(schema[key]) || isMongooseModel(schema[key])) {
      schema[key] = key === '$ref'
        ? mapModelNameToSwaggerSchemaPath(schema[key])
        : { $ref: mapModelNameToSwaggerSchemaPath(schema[key]) }
    } else if (schema[key] && !Array.isArray(schema[key]) && typeof schema[key] === 'object') {
      schema[key] = replaceRefModelBySchema(schema[key])
    }
  }

  return schema
}

export const paginationResponse = Model => ({
  type: 'object',
  properties: {
    count: {
      type: 'integer',
      example: 100
    },
    currentPage: {
      type: 'integer',
      example: 1
    },
    totalPages: {
      type: 'integer',
      example: 10
    },
    rows: {
      type: 'array',
      items: { $ref: Model }
    }
  }
})

export const arrayResponse = Model => ({
  type: 'array',
  items: {
    $ref: Model
  }
})

/**
 * Build swagger response
 *
 * @param  {Array.<{ code: Number, description: String?, example: Object?, mimeType: String?, schema: any? }>} responses
 * @return {Object}
 */
export const buildResponse = (...responses) => {
  const sanitizedResponses = uniqKeepLast(responses, response => response.code)

  const result = sanitizedResponses.reduce((carry, response) => {
    carry[response.code] = {
      description: response.description,
      content: {
        [response.mimeType || mimeType.json]: {
          ...(response.example ? { example: response.example } : {}),
          ...(response.schema
            ? { schema: replaceRefModelBySchema(response.schema) }
            : {})
        }
      }
    }

    if (response.code === HTTP._CODE.NO_CONTENT) {
      delete carry[response.code].content
    }

    return carry
  }, {})

  return result
}
