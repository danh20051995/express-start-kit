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
const layerItemSchema = Joi.alternatives([
  Joi.func(),
  Joi.object({
    method: Joi.func(),
    assign: [Joi.string(), Joi.any().strip()]
  })
])
const layerParallelItemSchema = Joi.array().items(layerItemSchema)
const eventLayerSchema = Joi.array().default([]).items(
  Joi.alternatives([
    layerItemSchema,
    layerParallelItemSchema
  ])
)

const routeSchema = Joi.object({
  method: Joi.array().single().unique().items(
    Joi.string().lowercase().valid(...methods)
  ).default(['get']),
  path: Joi.string().required(),
  tags: Joi.array().single().items(Joi.string()),
  summary: Joi.string(),

  preAuth: eventLayerSchema,
  auth: Joi.object({
    mode: Joi.string().valid('forbidden', 'required', 'optional', 'try').default('try')
  }).default({ mode: 'try' }).unknown(true),
  postAuth: eventLayerSchema,

  preValidation: eventLayerSchema,
  validation: Joi.object({
    headers: Joi.object(),
    params: Joi.object(),
    query: Joi.object(),
    body: Joi.object()
  }).unknown(true),
  postValidation: eventLayerSchema,

  pre: eventLayerSchema,
  handler: Joi.func(),
  swagger: Joi.object({
    response: Joi.object()
  })
})

const routesSchema = Joi.array().items(routeSchema).required()

export function coverValidationSchema (validationSchema) {
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
