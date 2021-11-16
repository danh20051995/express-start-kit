import Joi from 'joi'

/**
 * @param {import('joi').Schema} schema
 */
export const handlerValidation = (schema) => {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  return (req, res, next) => {
  /* defines a joi schema */
    const defaultSchema = {
      headers: Joi.object({}).unknown(true),
      params: Joi.object({}).unknown(true),
      query: Joi.object({}).unknown(true),
      body: Joi.object({}).unknown(true)
    }

    /* validate data */
    const data = {}
    for (const _f of Object.keys(defaultSchema)) {
      data[_f] = req[_f]
      if (!schema._ids._byKey.has(_f)) {
        schema = schema.append({ [_f]: defaultSchema[_f] })
      }
    }

    // cast file.array.single
    const bodySchema = schema._ids._byKey.get('body').schema
    const { keys: bodyFields = {} } = bodySchema.describe()
    for (const field of Object.keys(bodyFields)) {
      const isFileField = bodyFields[field].metas?.some(({ type }) => ['file', 'files'].includes(type))
      const castMultipleFilesField = isFileField && bodyFields[field].type === 'array' && data.body[field] && !Array.isArray(data.body[field])
      if (castMultipleFilesField) {
        data.body[field] = [data.body[field]]
      }
    }

    const { value, error } = schema.validate(data, {
      debug: true,
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    })

    if (error) {
      const errors = error.details.map(detail => detail.message)
      throw new Error(errors[0])
    }

    /* assign new value */
    Object.assign(req, value)

    return next()
  }
}
