import { PARAM_UUID_V4 } from '@/routes/parameters'
import { sleep } from '@/utils/helpers'
import * as Controller from './controller'
import * as Validation from './validate'

export default [
  {
    method: 'GET',
    path: '/todo/pre-test',
    tags: ['test'],
    summary: 'Pagination todo list',
    auth: { mode: 'try' },
    validation: Validation.testValidation,
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
    validation: Validation.testValidation,
    handler: Controller.index
  },
  {
    method: 'POST',
    path: `/todo/${PARAM_UUID_V4}`,
    tags: ['test'],
    summary: 'Test POST todo',
    auth: { mode: 'try' },
    validation: Validation.testValidation,
    handler: req => {
      console.log(req)
      return {
        headers: req.headers,
        params: req.params,
        query: req.query,
        body: req.body
      }
    }
  },
  {
    method: 'GET',
    path: '/todo/test/send',
    tags: ['test'],
    summary: 'Test response send',
    auth: { mode: 'try' },
    validation: Validation.testValidation,
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
    validation: Validation.testValidation,
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
    validation: Validation.testValidation,
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
    validation: Validation.testValidation,
    pre: [{
      method: () => {
        throw new Error('/todo/test/pre-throw')
      },
      assign: 'todo'
    }],
    handler: (req, res, next) => {
      return res.json({ message: '/todo/test/pre-throw' })
    }
  }
]
