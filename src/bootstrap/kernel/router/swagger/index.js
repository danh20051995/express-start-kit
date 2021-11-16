import { Router } from 'express'
import swaggerUI from 'swagger-ui-express'
import * as models from '@/database/models'
import { Converter } from './converter'
import { convertModelsToSwaggerSchemas } from './model-to-swagger'

/**
 * @typedef {{
 *  withCredentials: boolean
 *  layout: string
 *  tagsSorter: string
 *  apisSorter: string
 *  [key: string]: any
 * }} SwaggerOptions https://github.com/swagger-api/swagger-ui/blob/master/docs/usage/configuration.md#display
 */

const _options = {
  swagger: {
    openapi: '3.0.3',
    info: {
      version: '1.0.0',
      title: 'Documentation',
      contact: { email: 'example@email.com' },
      license: {
        name: 'Apache 2.0',
        url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
      }
    },
    servers: [],
    tags: [],
    components: {},
    paths: {}
  },
  routes: {},

  /** @type {import('swagger-ui-express').SwaggerUiOptions & { swaggerOptions: SwaggerOptions }} */
  swaggerUiOptions: {
    customSiteTitle: 'Documentation',
    customCss: `
       .swagger-ui .topbar { display: none }
       .swagger-ui .markdown code, .swagger-ui .renderedMarkdown code {color:#000000; background:#ffffff;}
    `,
    swaggerOptions: {
      withCredentials: false, // enables passing credentials|same domain only
      layout: 'StandaloneLayout',
      tagsSorter: 'alpha', // can also be a function
      apisSorter: 'alpha', // can also be a function
      // can also be 'alpha', 'method' or a function
      operationsSorter: (a, b) => {
        const methodsOrder = ['get', 'post', 'put', 'patch', 'delete', 'options', 'trace']
        let result = methodsOrder.indexOf(a.get('method')) - methodsOrder.indexOf(b.get('method'))

        if (result === 0) {
          result = a.get('path').localeCompare(b.get('path'))
        }

        return result
      }
    }
  }
}
export class RouterSwagger {
  constructor ({ swagger, routes, swaggerUiOptions } = _options) {
    this.options = {
      swagger: {
        ..._options.swagger,
        ...swagger
      },
      routes: {
        ..._options.routes,
        ...routes
      },
      swaggerUiOptions: {
        ..._options.swaggerUiOptions,
        ...swaggerUiOptions,
        swaggerOptions: {
          ..._options.swaggerUiOptions.swaggerOptions,
          ...swaggerUiOptions.swaggerOptions
        }
      }
    }
  }

  /**
   * @param {{ [key in string]: any }} routes
   * @param {{ [key in string]: any }} paths
   * @param {string} prefix
   */
  static recursiveRoutePaths (routes, paths = {}, prefix = '') {
    for (const key of Object.keys(routes)) {
      const _routes = routes[key]
      const _prefix = [prefix, key].filter(Boolean).join('/')
      if (Array.isArray(_routes)) {
        for (const route of _routes) {
          const {
            method,
            path,
            // validation,
            tags: _tags
          } = route
          const _cleanPath = path
            .replace(
              /((\/:)([a-zA-Z_]+)(\(([^)]+)\)))/g,
              (match, s1, s2, s3) => `/{${s3}}`
            )
            .replace(
              /(\/:([a-zA-Z_]+))/g,
              (match, s1, s2) => `/{${s2}}`
            )
          const _pathKey = [
            _prefix.startsWith('/') ? _prefix : `/${_prefix}`,
            _cleanPath.startsWith('/') ? _cleanPath : `/${_cleanPath}`
          ].join('').replace(/(^\/\/)|(\/\/$)/, '/')
          if (paths[_pathKey] && paths[_pathKey][method]) {
            throw new Error(
              `Router: "${String(method).toUpperCase()}|${_pathKey}" already exists`
            )
          }

          const converter = new Converter(route)
          paths[_pathKey] = {
            ...paths[_pathKey],
            [method]: {
              summary: converter.summary(),
              tags: _tags.map(t => `${(_prefix || 'default').replace(/(^\/)|(\/$)/, '').replace(/(\/)|(\/)/, '-')}-${t}`),
              security: converter.security(),
              responses: converter.responses(),
              operationId: converter.operationId(),
              description: converter.description(),
              parameters: converter.parameters(),
              requestBody: converter.requestBody()
            }
          }
        }
      } else {
        RouterSwagger.recursiveRoutePaths(_routes, paths, _prefix)
      }
    }

    return paths
  }

  getSwaggerSpecs () {
    return {
      ...this.options.swagger,
      components: {
        ...this.options.swagger.components,
        schemas: {
          ...this.options.swagger.components.schemas,
          ...convertModelsToSwaggerSchemas(models)
        }
      },
      paths: RouterSwagger.recursiveRoutePaths(this.options.routes, this.options.swagger.paths)
    }
  }

  getSwaggerUiOpts () {
    return {
      ...this.options.swaggerUiOptions,
      customSiteTitle: this.options.swagger?.info?.title || 'Documentation',
      swaggerOptions: {
        withCredentials: false, // enables passing credentials|same domain only
        layout: 'StandaloneLayout',
        tagsSorter: 'alpha', // can also be a function
        apisSorter: 'alpha', // can also be a function
        // can also be 'alpha', 'method' or a function
        operationsSorter: (a, b) => {
          const methodsOrder = ['get', 'post', 'put', 'patch', 'delete', 'options', 'trace']
          let result = methodsOrder.indexOf(a.get('method')) - methodsOrder.indexOf(b.get('method'))

          if (result === 0) {
            result = a.get('path').localeCompare(b.get('path'))
          }

          return result
        }
      }
    }
  }

  /** generate swagger swaggerSpecs */
  getRouter () {
    const router = Router()
    router.use('/', swaggerUI.serve)
    router.get('/', swaggerUI.setup(this.getSwaggerSpecs(), this.getSwaggerUiOpts()))
    return router
  }
}
