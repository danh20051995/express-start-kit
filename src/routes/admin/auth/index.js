import * as Validate from './validate'
import * as Controller from './controller'

export default [
  {
    method: 'POST',
    path: '/auth/login',
    tags: ['auth'],
    summary: 'Authentication login',
    auth: { mode: 'forbidden' },
    validation: Validate.login,
    pre: [],
    handler: Controller.login
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
    pre: [],
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
    validation: Validate.profile,
    pre: [],
    handler: Controller.profile
  },
  {
    method: 'GET',
    path: '/auth/refresh',
    tags: ['auth', '_TODO'],
    summary: 'Refresh token',
    auth: { mode: 'try' },
    validation: Validate.refreshToken,
    pre: [],
    handler: Controller.refreshToken
  }
]
