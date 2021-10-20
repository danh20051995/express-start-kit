const Joi = require('joi')

const generateOrderOptions = (fields = []) => {
  return fields.reduce(
    (sortOptions, field) => [
      ...sortOptions,
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

const joiObjectId = () => Joi.string().regex(/^[0-9a-fA-F]{24}$/)

const joiPagination = () => Joi.object({
  page: Joi.number().integer().min(1).default(1).description('Pagination page'),
  limit: Joi.number().integer().min(1).max(100).default(10).description('Pagination limit'),
  offset: Joi.number().integer().min(0).default(0).description('Pagination offset'),
  sort: Joi.string().valid(...generateOrderOptions()).default('createdAt-DESC').description('Pagination sort')
})

/**
 * Joi custom upload single file
 * @param {object} obj
 * @param {string[]} [obj.mimetypes]
 */
const joiFile = ({ mimetypes = [] } = {}) => Joi
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
const joiFiles = (...args) => Joi
  .array()
  .single()
  .items(joiFile(...args))
  .meta({ type: 'files' })

Joi.objectId = joiObjectId
Joi.pagination = joiPagination
Joi.file = joiFile
Joi.files = joiFiles

module.exports = {
  generateOrderOptions,
  joiObjectId,
  joiPagination,
  joiFile,
  joiFiles
}

// const Joi = require('joi')
// const objIdPattern = /^[0-9a-fA-F]{24}$/

// const isValid = function (value) {
//   return (Boolean(value) && !Array.isArray(value) && objIdPattern.test(String(value)))
// }

// module.exports = Joi.extend({
//   type: 'objectId',
//   messages: {
//     invalid: 'It must have a valid ObjectId.'
//   },
//   validate (value, { error }) {
//     if (!isValid(value)) {
//       return { value, errors: error('invalid') }
//     }
//   }
// })
