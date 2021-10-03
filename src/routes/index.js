import path from 'path'
import { RouterScanner } from '@/bootstrap/kernel/router'

export const routes = RouterScanner.config({
  dir: __dirname,
  routerFilename: 'index.js',
  routeFilter: _path => ![
    'index.js',
    'middleware.js',
    'parameters.js',
    'response-example.js'
  ].includes(path.relative(__dirname, _path)),
  routePrefix: _path => {
    const [_mod, version] = path
      .relative(__dirname, _path)
      .replace(/^\//, '')
      .split(/\/|\\/)

    const _version = /^v[0-9]{1,}$/.test(version) ? version : 'v1'

    return `${_mod}/${_version}`
  }
})

export default routes
