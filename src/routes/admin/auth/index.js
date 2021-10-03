import * as Validate from './validate'
import * as Controller from './controller'
import * as ResponseExample from './response-example'

export default [
  {
    method: 'POST',
    path: '/auth/login',
    tags: ['auth'],
    summary: 'Authentication login',
    auth: { mode: 'forbidden' },
    validation: Validate.login,
    handler: Controller.login,
    swagger: {
      response: ResponseExample.login
    }
  },
  {
    method: ['GET', 'DELETE'],
    path: '/auth/logout',
    tags: ['auth'],
    summary: 'Authentication logout',
    auth: {
      mode: 'required',
      allow: 'admin'
    },
    validation: Validate.logout,
    swagger: {
      response: ResponseExample.logout
    },
    handler: Controller.logout
  },
  {
    method: 'GET',
    path: '/auth/profile',
    tags: ['auth'],
    summary: 'Get current admin\'s profile',
    auth: {
      mode: 'required',
      allow: 'admin'
    },
    swagger: {
      response: ResponseExample.getProfile
    },
    validation: Validate.getProfile,
    handler: Controller.getProfile
  },
  {
    method: 'POST',
    path: '/auth/refresh',
    tags: ['auth'],
    summary: 'Refresh token',
    auth: { mode: 'try' },
    swagger: {
      response: ResponseExample.refreshToken
    },
    validation: Validate.refreshToken,
    handler: Controller.refreshToken
  }
]
