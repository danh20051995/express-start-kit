import Joi from 'joi'

export const testValidation = {
  headers: Joi.object({
    authorization: Joi.string().description('Bearer <REFRESH_TOKEN>')
  }).unknown(true),

  params: Joi.object({
    _id: Joi.string().guid().required().messages({
      'any.required': '_id field is required'
      // 'string.pattern.base': '_id field must be an ObjectId'
    })
  }),

  query: Joi.pagination(),

  body: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required().messages({
      'any.required': 'Password field is required',
      'string.min': 'Password must contain at least {{#limit}} characters long'
    }),
    image: Joi.file().required().messages({ 'any.required': 'Avatar field is required' }),
    images: Joi.files().min(2).max(2).required().messages({
      'array.min': '"images" must contain two items',
      'array.max': '"images" must contain two items'
    })
  })
}
