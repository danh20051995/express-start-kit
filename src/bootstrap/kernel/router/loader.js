import { Router } from 'express'
import { DocumentationRouter } from './swagger'
import { handlerAuthentication } from './handler-authentication'
import { handlerAuthorization } from './handler-authorization'
import { handlerRouteLayer } from './handler-event-layer'
import { handlerValidation } from './handler-validation'
import { handlerException } from './handler-exception'

function injectRoutes (routes) {
  const router = Router()
  for (const _route of routes) {
    try {
      const {
        method,
        path,
        preAuth,
        auth,
        postAuth,
        preValidation,
        validation,
        postValidation,
        pre,
        handler
      } = _route
      const _handlers = [
        // inject route with _route | avoid override express route
        (req, res, next) => {
          req._route = _route
          res._route = _route
          next()
        }
      ]

      if (preAuth) {
        _handlers.push(
          handlerRouteLayer(preAuth, 'preAuth')
        )
      }
      if (auth) {
        _handlers.push(
          handlerAuthentication(auth),
          handlerAuthorization(auth)
        )
      }
      if (postAuth) {
        _handlers.push(
          handlerRouteLayer(postAuth, 'postAuth')
        )
      }

      if (preValidation) {
        _handlers.push(
          handlerRouteLayer(preValidation, 'preValidation')
        )
      }

      if (validation) {
        _handlers.push(
          handlerValidation(validation)
        )
      }

      if (postValidation) {
        _handlers.push(
          handlerRouteLayer(postValidation, 'postValidation')
        )
      }

      if (pre) {
        _handlers.push(
          handlerRouteLayer(pre, 'pre')
        )
      }

      _handlers.push(
        handlerException(handler)
      )

      const _path = path.startsWith('/') ? path : `/${path}`

      router[method](_path, ..._handlers)
    } catch (error) {
      console.log(_route)
      throw error
    }
  }

  return router
}

/** Generate API */
function dynamicRoutes (_routes) {
  const router = Router()
  for (const prefix of Object.keys(_routes)) {
    const _childRoutes = _routes[prefix]
    const _childRouter = Array.isArray(_childRoutes)
      ? injectRoutes(_childRoutes)
      : dynamicRoutes(_childRoutes)
    router.use(`/${prefix}`, _childRouter)
  }

  return router
}

const _options = {
  routes: {},
  docOptions: {
    enable: true,
    url: '',
    path: '/',
    swagger: {}
  }
}

export const RouterLoader = {
  _options,
  config: ({
    routes,
    docOptions: {
      enable,
      url,
      path,
      swagger
    } = {}
  } = _options) => {
    _options.routes = routes
    const router = dynamicRoutes(routes)

    /** inject documentation router */
    if (enable) {
      console.log(
        `Documentation: ${[
          url.replace(/\/$/g, ''),
          path.replace(/^\//g, '')
        ].join('/')}`
      )
      router.use(path, DocumentationRouter.config({
        swagger,
        routes,
        swaggerUiOptions: {
          swaggerOptions: {
            withCredentials: true
          }
        }
      }))
    }

    return router
  }
}
