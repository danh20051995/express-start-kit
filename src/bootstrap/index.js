import cors from 'cors'
import express from 'express'
import { Config } from '@/config'
import { Documentation } from '@/constants/documentation'

import { routes } from '@/routes'
import { RouterLoader } from '@/router'
import { responseTimeLogger } from '@/middleware/response-time'
import { multipartHandling } from '@/middleware/multipart-handling'
import { errorHandler, notFoundHandler } from '@/middleware/error-handling'

export const bootstrap = async () => {
  // step by step
  const app = express()
  app.enable('trust proxy')

  // // setup view-engine and views global, filter
  // app.set('view engine', 'html')

  // allow cross site origin
  app.use(cors({
    origin: '*',
    allowedHeaders: ['Authorization'],
    methods: [
      'GET',
      // 'HEAD',
      'POST',
      'PUT',
      'PATCH',
      'DELETE'
    ]
  }))

  // general middleware
  app.use(responseTimeLogger)

  /* health check */
  app.use('/health', (req, res) =>
    res.json({
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
  app.use(multipartHandling())

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

export default bootstrap
