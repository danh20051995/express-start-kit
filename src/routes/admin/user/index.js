import { PARAM_OBJECT_ID } from '@/routes/parameters'

export default [
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
