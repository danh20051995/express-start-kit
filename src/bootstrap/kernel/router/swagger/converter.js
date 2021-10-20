import path from 'path'
import fs from 'fs'

import { HTTP } from '../../http'
import { joiToSwagger } from './joi-to-swagger'

export class Converter {
  #_route
  #_headers
  #_params
  #_query
  #_body
  #_hasFileInput
  #_response200 = Object.freeze({
    200: {
      content: {
        'application/json': {
          example: {
            type: 'OK',
            message: 'Success'
          }
        }
      }
    }
  })

  #_response400 = Object.freeze({
    400: {
      description: 'BadRequest',
      content: {
        'application/json': {}
      }
    }
  })

  #_responseAuthError = Object.freeze({
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {}
      }
    },
    403: {
      description: 'Forbidden',
      content: {
        'application/json': {}
      }
    },
    498: {
      description: 'InvalidToken',
      content: {
        'application/json': {}
      }
    }
  })

  constructor (route) {
    this.#_route = route
    this.generateValidation(this.#_route.validation)
  }

  security () {
    return this.#_route.auth.mode === 'forbidden' ? [] : [{ JWT: [] }]
  }

  summary () {
    return this.#_route.summary
  }

  /**
   * @param {Joi.ObjectSchema} schema
   */
  generateValidation (schema) {
    if (!schema) {
      return
    }

    const mergeSchema = {}
    for (const _f of ['headers', 'params', 'query', 'body']) {
      if (schema._ids._byKey.has(_f)) {
        mergeSchema[_f] = schema._ids._byKey.get(_f).schema
      }
    }

    const { swagger: { properties: { headers, params, query, body } } } = joiToSwagger(mergeSchema)

    this.#_headers = headers
    this.#_params = params
    this.#_query = query
    this.#_body = body

    if (schema._ids._byKey.has('body')) {
      const bodySchema = schema._ids._byKey.get('body').schema
      const { keys = {} } = bodySchema.describe()
      const swaggerFileField = {
        type: 'string',
        format: 'binary',
        description: 'FileInput binary'
      }

      for (const key of Object.keys(keys)) {
        const isFileField = keys[key]?.metas?.some(
          ({ type }) => ['file', 'files'].includes(type)
        )

        if (isFileField) {
          this.#_hasFileInput = true
          body.properties[key].type !== 'array'
            ? body.properties[key] = swaggerFileField
            : body.properties[key].items = swaggerFileField
        }
      }
    }
  }

  parameters () {
    const _parameters = []
    if (this.#_query) {
      _parameters.push(
        ...Object.keys(this.#_query.properties).map(
          (name) => ({
            name,
            in: 'query',
            schema: this.#_query.properties[name],
            required: this.#_query.required && this.#_query.required.includes(name)
          })
        )
      )
    }

    if (this.#_params) {
      _parameters.push(
        ...Object.keys(this.#_params.properties).map(
          (name) => ({
            name,
            in: 'path',
            schema: this.#_params.properties[name],
            required: this.#_params.required && this.#_params.required.includes(name)
          })
        )
      )
    }

    return _parameters.length ? _parameters : undefined
  }

  requestBody () {
    if (this.#_body) {
      const requestBody = {
        content: {
          // 'application/x-www-form-urlencoded': {
          //   schema: this.#_body
          //   // required: true
          // },
          'multipart/form-data': {
            schema: this.#_body
            // required: true
          }
        }
      }

      if (!this.#_hasFileInput) {
        requestBody.content['application/x-www-form-urlencoded'] = {
          schema: this.#_body
          // required: true
        }
      }

      requestBody.content['application/json'] = {
        schema: this.#_body
      }

      return requestBody
    }
  }

  /**
   * HTTP._CODE
   */
  responses () {
    const response = {}

    if (this.#_route.swagger?.response) {
      Object.assign(response, this.#_route.swagger.response)
    } else {
      // use scanner
      const handlerSrcCode = Converter.getSourceOfHandler(this.#_route)

      for (const codeName of Object.keys(HTTP._CODE)) {
        if (handlerSrcCode.includes(codeName)) {
          response[HTTP._CODE[codeName]] = {
            description: codeName,
            content: {
              'application/json': {}
            }
          }
        }
      }
    }

    if (this.#_route.auth) {
      // By place these repsonses first, we can make sure that it will not overwrite responses from this.#_route.swagger.response
      Object.assign(response, this.#_responseAuthError)
    }

    if (this.#_route.validation) {
      // By place these repsonses first, we can make sure that it will not overwrite responses from this.#_route.swagger.response
      Object.assign(response, this.#_response400)
    }

    if (Object.keys(response).every(code => (+code < 200 || (+code) > 299))) {
      Object.assign(response, this.#_response200)
    }

    return response
  }

  description () {
    const descriptionContent = []
    const authenticationInfo = this.#_route.auth
      ? [
        '---------- Authentication ----------',
        JSON.stringify(this.#_route.auth, null, 4)
      ].join('\n')
      : ''

    if (authenticationInfo) {
      descriptionContent.push(authenticationInfo)
    }

    if (this.#_route.validation) {
      const validationInfo = [
        '---------- Validation ----------',
        JSON.stringify({
          headers: this.#_headers?.properties,
          params: this.#_params?.properties,
          query: this.#_query?.properties,
          body: this.#_body?.properties
        }, null, 4)
      ].join('\n')

      descriptionContent.push(validationInfo)
    }

    return [
      '<pre>',
      Converter.htmlEscape(descriptionContent.join('\n')),
      '</pre>'
    ].join('\n')
  }

  operationId () {
    const { method, path } = this.#_route
    const parts = path
      .replace(/([^A-Za-z0-9-/]*)/g, '')
      .split('/')
      .filter(Boolean)

    return [method, ...(parts.length === 1 ? parts : parts.slice(1))]
      .join('-')
      .replace(/[-]*$/g, '')
  }

  /**
   * @param {string} string
   * @returns {string}
   */
  static htmlEscape (string) {
    /** Used to map characters to HTML entities. */
    const htmlEscapes = {
      $: '&#36;',
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;'
    }

    /** Used to match HTML entities and HTML characters. */
    const reUnescapedHtml = new RegExp(`[${Object.keys(htmlEscapes).join('')}]`, 'g')
    const reHasUnescapedHtml = new RegExp(`[${Object.keys(htmlEscapes).join('')}]`)
    return (string && reHasUnescapedHtml.test(string))
      ? string.replace(reUnescapedHtml, (chr) => htmlEscapes[chr])
      : (string || '')
  }

  /**
   * Map route to controller source, used to cache
   */
  static controllerSourcesOf = new Map()

  static getSourceOfHandler (route) {
    try {
      const handlerName = route.handler?.name
      if (!handlerName) return ''

      const pathToController = path.join(route._path, '..', 'controller.js')
      let sourceOfController = Converter.controllerSourcesOf.get(pathToController)

      if (!sourceOfController) {
        sourceOfController = fs.readFileSync(pathToController, { encoding: 'utf-8' })
        Converter.controllerSourcesOf.set(pathToController, sourceOfController)
      }

      const handlerPatterns = [`export const ${handlerName}`, `export function ${handlerName}`]
      const nexHandlerPatterns = ['export const', 'export function']

      let indexStartOfHandler = -1

      for (const pattern of handlerPatterns) {
        const found = sourceOfController.indexOf(pattern)
        if (found !== -1) {
          indexStartOfHandler = found
          break
        }
      }

      if (indexStartOfHandler === -1) return ''

      let indexEndOfHandler = -1
      const sourceStartFromHandler = sourceOfController.substr(indexStartOfHandler + 15)

      for (const pattern of nexHandlerPatterns) {
        const found = sourceStartFromHandler.indexOf(pattern)
        if (found !== -1) {
          indexEndOfHandler = found
          break
        }
      }

      if (indexEndOfHandler === -1) {
        return sourceStartFromHandler.substr(0)
      }

      return sourceStartFromHandler.substr(0, indexEndOfHandler)
    } catch (err) {
      return ''
    }
  }
}
