import glob from 'glob'
import { validRoutes } from './valid-routes'

/**
 * Resolve a ES5 or ES6+ modules
 * @param {String} path
 * @returns {any[]}
 */
const resolveModule = path => {
  const module = require(path)
  return (module && module.default) || module
}

const _options = {
  dir: '',
  routeFilename: 'index.js',
  routerFilter: _path => true,
  routerPrefix: _path => ''
}

export const RouterScanner = {
  _options,
  config (options = _options) {
    Object.assign(_options, options)

    return glob
      .sync(`${_options.dir.replace(/\/$/g, '')}/**/${_options.routeFilename}`)
      .filter(_options.routerFilter)
      .reduce((routes, _path) => {
        const _prefix = (_options.routerPrefix && _options.routerPrefix(_path)) || ''
        if (!routes[_prefix]) {
          routes[_prefix] = []
        }

        const resolvedModule = validRoutes(resolveModule(_path))
        const flatByMethod = resolvedModule.reduce(
          (moduleRoutes, route) => [
            ...moduleRoutes,
            ...route.method.map(
              method => ({
                ...route,
                method
              })
            )
          ], []
        )

        routes[_prefix].push(...flatByMethod)

        return routes
      }, {})
  }
}

export default RouterScanner
