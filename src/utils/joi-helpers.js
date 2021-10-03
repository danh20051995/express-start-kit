import Joi from 'joi'

/**
 * @param {string[]} fields
 * @returns {string[]}
 */
export const generateOrderOptions = (fields = []) => {
  return fields.reduce(
    (orderOptions, field) => [
      ...orderOptions,
      `${field}-ASC`,
      `${field}-DESC`
    ],
    [
      'updatedAt-ASC',
      'updatedAt-DESC',
      'createdAt-ASC',
      'createdAt-DESC'
    ]
  )
}

export const joiPagination = () => Joi.object({
  page: Joi.number().integer().min(1).default(1).description('Pagination page'),
  limit: Joi.number().integer().min(1).max(100).default(10).description('Pagination limit'),
  offset: Joi.number().integer().min(0).default(0).description('Pagination offset'),
  order: Joi.string().valid(...generateOrderOptions()).default('createdAt-DESC').description('Pagination order')
})

/**
 * Joi custom upload single file
 * @param {object} obj
 * @param {string[]} [obj.mimetypes]
 */
export const joiFile = ({ mimetypes = [] } = {}) => Joi
  .object({
    size: Joi.number().required(),
    path: Joi.string().required(),
    filename: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: mimetypes.length
      ? Joi.string().required()
      : Joi.string().valid(...mimetypes).required(),
    // fieldname: Joi.string().required(),
    destination: Joi.string().required(),
    originalname: Joi.string().required()
  })
  .meta({ type: 'file' })

/**
 * Joi custom upload single file
 * @param {object} obj
 * @param {string[]} [obj.mimetypes]
 */
export const joiFiles = (...args) => Joi
  .array()
  .single()
  .items(joiFile(...args))
  .meta({ type: 'files' })
