import Joi from 'joi'

const METHODS = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  PATCH: 'patch',
  DELETE: 'delete'
}

/* Validate routes definition */
const methods = Object.values(METHODS)
const preItemSchema = Joi.alternatives([
  Joi.func(),
  Joi.object({
    method: Joi.func(),
    assign: [Joi.string(), Joi.any().strip()]
  })
])
const preParallelItemSchema = Joi.array().items(preItemSchema)

const routeSchema = Joi.object({
  method: Joi.array().single().unique().items(
    Joi.string().lowercase().valid(...methods)
  ).default(['get']),
  path: Joi.string().required(),
  tags: Joi.array().single().items(Joi.string()),
  summary: Joi.string(),
  auth: Joi.object({
    mode: Joi.string().valid('forbidden', 'required', 'optional', 'try').default('try')
  }).default({ mode: 'try' }).unknown(true),
  validation: Joi.object({
    headers: Joi.object(),
    params: Joi.object(),
    query: Joi.object(),
    body: Joi.object()
  }).unknown(true),
  pre: Joi.array().items(
    Joi.alternatives([
      preItemSchema,
      preParallelItemSchema
    ])
  ),
  handler: Joi.func()
})

const routesSchema = Joi.array().items(routeSchema).required()

function coverValidationSchema (validationSchema) {
  if (validationSchema) {
    if (!Joi.isSchema(validationSchema)) {
      for (const key of Object.keys(validationSchema)) {
        validationSchema[key] = coverValidationSchema(validationSchema[key])
      }

      validationSchema = Joi.object(validationSchema)
    }

    return validationSchema
  }
}

export function validRoutes (routes) {
  const { value: _routes, error } = routesSchema.validate(routes)
  if (error) {
    throw error
  }

  for (const _route of _routes) {
    if (_route.validation) {
      _route.validation = coverValidationSchema(_route.validation)
    }
  }

  return _routes
}
