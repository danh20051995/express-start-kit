import cors from 'cors'
import express from 'express'

import Config from 'config'
import { routes } from '@/routes'
import { Documentation } from '@/constants/documentation'

import { RouterLoader } from './kernel/router'
import { timeoutHandler } from './kernel/middleware/timeout-handling'
import { injectURLInfo } from './kernel/middleware/inject-url-info'
import { responseTimeLogger } from './kernel/middleware/response-time'
import { multipartHandler } from './kernel/middleware/multipart-handling'
import { errorHandler, notFoundHandler } from './kernel/middleware/error-handling'

export const bootstrap = () => {
  // step by step
  const app = express()
  app.enable('trust proxy')

  // // setup view-engine and views global, filter
  // app.set('view engine', 'html')

  // general middleware
  app.use(timeoutHandler)
  app.use(injectURLInfo)
  app.use(responseTimeLogger)

  // allow cross site origin
  app.use(cors({
    origin: '*',
    allowedHeaders: [
      'accept',
      'accept-language',
      'content-language',
      'content-type',
      'authorization'
    ],
    methods: [
      'GET',
      // 'HEAD',
      'POST',
      'PUT',
      'PATCH',
      'DELETE'
    ]
  }))

  /* health check */
  app.use(
    '/health',
    (req, res) => res.json({
      statusCode: 200,
      message: 'OK',
      type: 'OK'
    })
  )

  // support parsing of application/json type post data
  app.use(express.json({ limit: '50mb' }))
  // support parsing of application/x-www-form-urlencoded post data
  app.use(express.urlencoded({
    limit: '50mb',
    extended: true
  }))

  // handle multipart file upload
  app.use(multipartHandler())

  /** inject app router */
  app.use(RouterLoader.config({
    routes,
    docOptions: {
      enable: !process.isProd,
      url: Config.get('connection.domain'),
      path: '/documentation',
      swagger: Documentation
    }
  }))

  // last thing | error handling
  // Response 404
  app.use(notFoundHandler)
  // Response error status code
  app.use(errorHandler)

  return app
}
