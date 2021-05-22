import joiToSwagger from './joi-to-swagger'

export class Converter {
  #_route
  #_headers
  #_params
  #_query
  #_body
  #_hasFileInput

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
      const { keys } = bodySchema.describe()
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

      return requestBody
    }
  }

  /**
   * HTTP.definition
   */
  responses () {
    return {
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
    }
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
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#39;'
    }

    /** Used to match HTML entities and HTML characters. */
    const reUnescapedHtml = /[&<>"']/g
    const reHasUnescapedHtml = RegExp(reUnescapedHtml.source)
    return (string && reHasUnescapedHtml.test(string))
      ? string.replace(reUnescapedHtml, (chr) => htmlEscapes[chr])
      : (string || '')
  }
}
