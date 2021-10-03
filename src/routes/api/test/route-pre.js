import { PARAM_UUID_V4 } from '@/routes/parameters'
import { sleep } from '@/utils/helpers'
import Joi from 'joi'
import * as Controller from './controller'
import * as Validation from './validate'

export default [
  {
    method: 'GET',
    path: '/todo/pre-test',
    tags: ['test'],
    summary: 'Pagination todo list',
    auth: { mode: 'try' },
    // validation: Validation.testValidation,
    pre: [
      (req, res) => {
        console.log('Pre middleware 1')
      },
      [
        (req, res) => {
          console.log('Pre middleware 21')
        },
        {
          method: async (req, res) => {
            await sleep(1000)
            console.log('Pre middleware 22')
            return Math.random()
          },
          assign: 'randomNo22'
        },
        {
          method: (req, res) => {
            console.log('Pre middleware 23')
            return Math.random()
          },
          assign: 'randomNo23'
        }
      ],
      {
        method: (req, res) => {
          console.log('Pre middleware 3')
        }
      },
      {
        method: (req, res) => {
          console.log('Pre middleware 4')
          return Math.random()
        },
        assign: 'randomNo4'
      }
    ],
    handler: (req, res, next) => {
      return res.json(req.pre)
    }
  },
  {
    method: 'GET',
    path: '/todo',
    tags: ['test'],
    summary: 'Test todo',
    auth: { mode: 'try' },
    // validation: Validation.testValidation,
    handler: Controller.index
  },
  {
    method: 'GET',
    path: '/todo/test/timeout/:number',
    tags: ['test'],
    summary: 'Test timeout',
    auth: { mode: 'try' },
    validation: {
      params: Joi.object({
        number: Joi.number().integer().min(1).required()
      })
    },
    handler: async req => {
      req.session.cookie.path = req.URL.pathname
      req.session.timer = (req.session.timer || 0) + 1
      console.log(req.session)
      const _number = Number(req.params.number)
      if (_number) {
        await sleep(_number)
      }
      return { timeout: _number }
    }
  },
  {
    method: 'GET',
    path: '/todo/test/send',
    tags: ['test'],
    summary: 'Test response send',
    auth: { mode: 'try' },
    // validation: Validation.testValidation,
    pre: [{
      method: () => ({ message: '/todo/test/send' }),
      assign: 'todo'
    }],
    handler: (req, res, next) => {
      return res.send(req.pre.todo)
    }
  },
  {
    method: 'GET',
    path: '/todo/test/json',
    tags: ['test'],
    summary: 'Test response json',
    auth: { mode: 'try' },
    // validation: Validation.testValidation,
    pre: [{
      method: () => ({ message: '/todo/test/json' }),
      assign: 'todo'
    }],
    handler: (req, res, next) => {
      return res.json(req.pre.todo)
    }
  },
  {
    method: 'GET',
    path: '/todo/test/throw',
    tags: ['test'],
    summary: 'Test response throw',
    auth: { mode: 'try' },
    // validation: Validation.testValidation,
    pre: [{
      method: () => ({}),
      assign: 'todo'
    }],
    handler: (req, res, next) => {
      throw new Error('/todo/test/throw')
    }
  },
  {
    method: 'GET',
    path: '/todo/test/pre-throw',
    tags: ['test'],
    summary: 'Test response pre-throw',
    auth: { mode: 'try' },
    // validation: Validation.testValidation,
    pre: [{
      method: () => {
        throw new Error('/todo/test/pre-throw')
      },
      assign: 'todo'
    }],
    handler: (req, res, next) => {
      return res.json({ message: '/todo/test/pre-throw' })
    }
  },
  {
    method: 'POST',
    path: `/todo/${PARAM_UUID_V4}`,
    tags: ['test'],
    summary: 'Test POST todo',
    auth: { mode: 'try' },
    validation: Validation.testValidation,
    handler: req => ({
      headers: req.headers,
      params: req.params,
      query: req.query,
      body: req.body
    })
  }
]
