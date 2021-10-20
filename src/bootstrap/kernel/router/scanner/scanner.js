import glob from 'glob'
import { validRoutes } from './valid-routes'

/**
 * Resolve a ES5 or ES6+ modules
 * @param {string} path
 * @returns {any[]}
 */
const resolveModule = path => {
  const module = require(path)
  return (module && module.default) || module
}

const _options = {
  dir: '',
  routeFilename: 'index.js',
  /**
   * Filter route
   * @param {string} _path route file path
   * @returns {boolean} not load route if false
   */
  routeFilter: _path => true,
  /**
   * Get optional route prefix
   * @param {string} _path route file path
   * @returns {string} route prefix
   */
  routePrefix: _path => '',
  /**
   * Get route events middleware
   * @param {string} _path route file path
   * @param {object} route route config
   * @returns {{ [key in 'pre'|'preAuth'|'postAuth'|'preValidation'|'postValidation']: Function[] | { method: Function, assign: string }[] }}
   */
  routeMiddleware: (_path, route) => ({})
}

export const RouterScanner = {
  _options,
  config (options = _options) {
    Object.assign(_options, options)

    return glob
      .sync(`${_options.dir.replace(/\/$/g, '')}/**/${_options.routeFilename}`)
      .filter(_options.routeFilter)
      .reduce((routes, _path) => {
        const _prefix = (_options.routePrefix && _options.routePrefix(_path)) || ''
        if (!routes[_prefix]) {
          routes[_prefix] = []
        }

        const resolvedModule = validRoutes(resolveModule(_path))
        const flatByMethod = resolvedModule.reduce(
          (moduleRoutes, route) => [
            ...moduleRoutes,
            ...route.method.map(
              method => {
                const {
                  preAuth = [],
                  postAuth = [],
                  preValidation = [],
                  postValidation = [],
                  pre = []
                } = _options.routeMiddleware(_path, {
                  ...route,
                  method
                })
                return {
                  ...route,
                  _path,
                  method,
                  preAuth: [
                    ...preAuth,
                    ...route.preAuth
                  ],
                  postAuth: [
                    ...postAuth,
                    ...route.postAuth
                  ],
                  preValidation: [
                    ...preValidation,
                    ...route.preValidation
                  ],
                  postValidation: [
                    ...postValidation,
                    ...route.postValidation
                  ],
                  pre: [
                    ...pre,
                    ...route.pre
                  ]
                }
              }
            )
          ], []
        )

        routes[_prefix].push(...flatByMethod)

        return routes
      }, {})
  }
}
