import pick from 'lodash/pick'
import capitalize from 'lodash/capitalize'

const _CODE = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INVALID_TOKEN: 498
}

const definition = Object.entries(_CODE).reduce(
  (merge, [type, code]) => ({
    ...merge,
    [code]: {
      type,
      message: capitalize(type.replace(/_/gm, ' '))
    }
  }),
  {}
)

export class HTTP extends Error {
  static _CODE = _CODE
  static definition = definition

  /**
   * @param {string} message
   * @param {string} type
   * @param {number} code
   * @param {object} details
   * @param {any} stack
   */
  constructor (code, message, details) {
    super(code)
    if (!definition[code]) {
      throw new Error(`Invalid status code: ${code}`)
    }

    this.name = 'HTTP'
    this.code = code
    this.statusCode = code
    this.details = details
    this.type = definition[code].type
    this.message = message || definition[code].message || this.message
  }

  /** Converts API response to a plain object */
  toObject = () => {
    const obj = {
      ...pick(this, [
        'type',
        'statusCode',
        'message',
        'details'
      ])
    }

    if (!process.isProd) {
      obj.stack = this.stack
    }

    return obj
  }
}
