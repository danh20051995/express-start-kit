import Joi from 'joi'
import { REGEX_VIETNAM_PHONE_NO } from '@/constants/regex'

export const login = {
  body: Joi.object({
    phone: Joi.string().trim().pattern(REGEX_VIETNAM_PHONE_NO).required().label('phone').messages({
      'string.pattern.base': 'Invalid phone number'
    }),
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
  // body: login.body.append({
  //   refreshToken: Joi.string().trim().required().label('refreshToken')
  // })
  body: Joi.object({
    refreshToken: Joi.string().trim().required().label('refreshToken')
  })
}

export const profile = {}
