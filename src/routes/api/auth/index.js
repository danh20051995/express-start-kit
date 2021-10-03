import * as Validate from './validate'
import * as Controller from './controller'
import * as ResponseExample from './response-example'

export default [
  {
    method: 'GET',
    path: '/auth/profile',
    tags: ['auth'],
    summary: 'Get current user\'s profile',
    auth: {
      mode: 'required',
      allow: 'user'
    },
    swagger: {
      response: ResponseExample.profile
    },
    validation: Validate.profile,
    handler: Controller.profile
  },
  {
    method: 'POST',
    path: '/auth/login',
    tags: ['auth'],
    summary: 'User login with phone and password',
    auth: { mode: 'forbidden' },
    swagger: {
      response: ResponseExample.login
    },
    validation: Validate.login,
    handler: Controller.login
  },
  {
    method: 'POST',
    path: '/auth/refresh',
    tags: ['auth'],
    summary: 'Renew token with refreshToken + phone + password',
    auth: { mode: 'try' },
    validation: Validate.refreshToken,
    swagger: {
      response: ResponseExample.refreshToken
    },
    handler: Controller.refreshToken
  },
  {
    method: ['GET', 'DELETE'],
    path: '/auth/logout',
    tags: ['auth'],
    summary: 'User logout',
    auth: {
      mode: 'required',
      allow: 'user'
    },
    validation: Validate.logout,
    handler: Controller.logout
  }
]
