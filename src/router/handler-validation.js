import Joi from 'joi'

export const handlerValidation = (schema) => (req, res, next) => {
  /* defines a joi schema */
  const defaultSchema = {
    headers: Joi.object({}).unknown(true),
    params: Joi.object({}).unknown(true),
    query: Joi.object({}).unknown(true),
    body: Joi.object({}).unknown(true)
  }

  /* validate payloads */
  const payloads = {}
  for (const _f of Object.keys(defaultSchema)) {
    payloads[_f] = req[_f]
    if (!schema._ids._byKey.has(_f)) {
      schema.append({ [_f]: defaultSchema[_f] })
    }
  }

  const { value, error } = schema.validate(payloads, {
    debug: true,
    abortEarly: false,
    allowUnknown: true
  })

  if (error) {
    const errors = error.details.map(detail => detail.message)
    throw new Error(errors[0])
  }

  /* assign new value */
  Object.assign(req, value)

  return next()
}
