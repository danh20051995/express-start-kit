import { Router } from 'express'
import swaggerUI from 'swagger-ui-express'
import * as models from '@/database/models'
import { Converter } from './converter'
import { convertModelsToSwaggerSchemas } from './model-to-swagger'

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
  swaggerUiOptions: {
    customSiteTitle: 'Documentation',
    customCss: `
       .swagger-ui .topbar { display: none }
       .swagger-ui .markdown code, .swagger-ui .renderedMarkdown code {color:#000000; background:#ffffff;}
     `
  }
}

function recursiveRoutePaths (routes, paths = {}, prefix = '') {
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
      recursiveRoutePaths(_routes, paths, _prefix)
    }
  }

  return paths
}

/** generate swagger swaggerSpecs */
function generateDocRouter () {
  const swaggerSpecs = {
    ..._options.swagger,
    components: {
      ..._options.swagger.components,
      schemas: {
        ..._options.swagger.components.schemas,
        ...convertModelsToSwaggerSchemas(models)
      }
    },
    paths: recursiveRoutePaths(_options.routes, _options.swagger.paths)
  }

  const router = Router()
  router.use('/', swaggerUI.serve)
  router.get('/', swaggerUI.setup(swaggerSpecs, {
    ..._options.swaggerUiOptions,
    customSiteTitle: _options.swagger?.info?.title || 'Documentation',
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
      },
      ..._options.swaggerUiOptions.swaggerOptions
    }
  }))

  return router
}

export const DocumentationRouter = {
  _options,
  /**
   * @param {{
   *   swagger: typeof _options.swagger
   *   routes: { [key in string]: any }
   *   swaggerUiOptions: import('swagger-ui-express').SwaggerUiOptions
   * }}
   */
  config: ({ swagger, routes, swaggerUiOptions } = _options) => {
    _options.swagger = {
      ..._options.swagger,
      ...swagger
    }
    _options.routes = {
      ..._options.routes,
      ...routes
    }
    _options.swaggerUiOptions = {
      ..._options.swaggerUiOptions,
      ...swaggerUiOptions
    }
    return generateDocRouter()
  }
}
