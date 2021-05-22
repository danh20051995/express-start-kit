import { PARAM_OBJECT_ID } from '@/routes/parameters'
// import { sleep } from '@/utils/helpers'
import * as Controller from './controller'

export default [
  {
    method: 'GET',
    path: '/users',
    tags: ['users'],
    summary: 'Pagination users list',
    // pre: [{
    //   method: () => {
    //     throw new Error('Oops')
    //   },
    //   assign: 'user'
    // }],
    handler: Controller.index
  },
  {
    method: 'GET',
    path: `users/${PARAM_OBJECT_ID}`,
    tags: ['users'],
    summary: 'Get user\'s detail',
    pre: [{
      method: () => {
        throw new Error('Oops')
      },
      assign: 'user'
    }],
    handler: (req, res, next) => {
      return res.json({ _id: req.params._id })
    }
  }
]
