import Joi from 'joi'

/** Page number */
export const joiPage = () => Joi.number().integer().min(1).default(1).description('Pagination page')

/** Limit number of records per page */
export const joiLimit = () => Joi.number().integer().min(1).max(100).default(10).description('Pagination limit')

/** Number of records will be skipped */
export const joiOffset = () => Joi.number().integer().min(0).default(0).description('Pagination offset')

export const joiPagination = () => Joi.object({
  page: joiPage(),
  limit: joiLimit(),
  offset: joiOffset()
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
