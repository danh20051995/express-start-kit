import { HTTP } from '@/bootstrap/kernel/http'
import { Config } from '@/config'
import { uniqKeepLast } from '@/utils/array'
import { getModelName, isMongooseModel, isSequelizeModel } from './util'

const mimeType = {
  json: 'application/json'
}

const mapModelNameToSwaggerSchemaPath = Model => {
  return `#/components/schemas/${getModelName(Model)}`
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

export const paginationResponse = Model => {
  if (!Config.get('documentation.enabled')) {
    return {}
  }

  return {
    type: 'object',
    properties: {
      offset: {
        type: 'integer',
        example: 0
      },
      limit: {
        type: 'integer',
        example: 10
      },
      total: {
        type: 'integer',
        example: 100
      },
      page: {
        type: 'integer',
        example: 1
      },
      pages: {
        type: 'integer',
        example: 10
      },
      rows: {
        type: 'array',
        items: { $ref: Model }
      }
    }
  }
}

/**
 * Build swagger response
 *
 * @param  {Array<{ code: number, description?: string, example?: Object, mimeType?: string, headers?: { [key in string]: string } , schema?: any }>} responses
 * @return {{ [k in number]: { description: string, content: { [k in string]: { example?: any } } } }}
 */
export const buildResponse = (...responses) => {
  if (!Config.get('documentation.enabled')) {
    return {}
  }

  const sanitizedResponses = uniqKeepLast(responses, response => response.code)

  const result = sanitizedResponses.reduce((carry, response) => {
    const schemaName = getModelName(response?.schema)
    carry[response.code] = {
      description: response.description || schemaName ? `${schemaName} information` : '',
      headers: response.headers,
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
