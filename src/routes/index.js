import path from 'path'
import { RouterScanner } from '@/router'

export const routes = RouterScanner.config({
  dir: __dirname,
  routerFilename: 'index.js',
  routerFilter: _path => !['index.js', 'parameters.js'].includes(
    path.relative(__dirname, _path)
  ),
  routerPrefix: _path => {
    const [_mod, version] = path
      .relative(__dirname, _path)
      .replace(/^\//, '')
      .split(/\/|\\/)

    const _version = /^v[0-9]{1,}$/.test(version) ? version : 'v1'

    return `${_mod}/${_version}`
  }
})

export default routes
