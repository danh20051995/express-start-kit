import path from 'path'
import cors from 'cors'
import express from 'express'

import { Config } from '@/config'
import { routes } from '@/routes'
import { Documentation } from '@/constants/documentation'

import { RouterLoader, RouterSwagger } from './kernel/router'
import { timeoutMiddleware } from './kernel/middleware/timeout'
import { injectURLMiddleware } from './kernel/middleware/inject-url'
import { responseTimeMiddleware } from './kernel/middleware/response-time'
import { sizeLimitMiddleware } from './kernel/middleware/size-limit'
import { multipartMiddleware } from './kernel/middleware/multipart'
import { errorHandler, notFoundHandler } from './kernel/router/handler-errors'

export const bootstrap = () => {
  // step by step
  // https://expressjs.com/en/guide/behind-proxies.html
  const app = express()
  app.enable('trust proxy')
  app.set('trust proxy', 1) // trust first proxy

  // // setup view-engine and views global, filter
  // app.set('view engine', 'html')

  // general middleware
  app.use(injectURLMiddleware)
  app.use(timeoutMiddleware(Config.get('connection.timeout')))
  app.use(responseTimeMiddleware)

  // allow cross-origin resource sharing
  app.use(cors(Config.get('cors')))

  // limit request size
  app.use(sizeLimitMiddleware({ limit: Config.get('connection.sizeLimit') }))
  // support parsing of application/json type post data
  app.use(express.json({}))
  // support parsing of application/x-www-form-urlencoded post data
  app.use(express.urlencoded({ extended: true }))
  // handle multipart file upload
  app.use(multipartMiddleware({
    tempDir: path.join(process.cwd(), 'temp'),
    cleanup: false
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

  /** inject app router */
  app.use(new RouterLoader({ routes }).getRouter())

  /** inject documentation router */
  if (Config.get('documentation.enabled')) {
    const routerSwagger = new RouterSwagger({
      swagger: Documentation,
      routes,
      swaggerUiOptions: {
        swaggerOptions: {
          withCredentials: Config.get('cors.credentials') || false
        }
      }
    })

    /**
     * @type {string}
     */
    const docRoutePath = Config.get('documentation.path')
    app.use(docRoutePath.startsWith('/') ? docRoutePath : `/${docRoutePath}`, routerSwagger.getRouter())
    console.log(
      `Documentation: ${[
        Config.get('connection.domain').replace(/\/$/g, ''),
        docRoutePath.replace(/^\//g, '')
      ].join('/')}`
    )
  }

  // last thing | error handling
  // Response 404
  app.use(notFoundHandler)
  // Response error status code
  app.use(errorHandler)

  return app
}
