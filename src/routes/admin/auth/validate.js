import Joi from 'joi'

export const login = {
  body: Joi.object({
    username: Joi.string().required().label('identification').description('admin\'s username or email'),
    password: Joi.string().min(6).required().label('password').messages({
      'any.required': 'Password field is required',
      'string.min': 'Password must contain at least {{#limit}} characters long'
    }),
    device: Joi.string().allow('').label('device'),
    os: Joi.string().allow('').label('os')
  })
}

export const logout = {}

export const refreshToken = {
  body: Joi.object({
    refreshToken: Joi.string().trim().required().label('refreshToken')
  })
}

export const getProfile = {}
