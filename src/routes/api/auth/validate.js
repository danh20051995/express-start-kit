import Joi from 'joi'

export const login = {
  body: Joi.object({
    username: Joi.string().required().description('user\'s username or email'),
    password: Joi.string().min(6).required().description('user\'s password').messages({
      'any.required': 'Password field is required.',
      'string.min': 'Password must contain at least {{#limit}} characters long.'
    })
  })
}

export const logout = {}

export const profile = {}

export const refreshToken = {
  headers: Joi.object({
    authorization: Joi.string().required().description('Bearer <REFRESH_TOKEN>')
  })
}
