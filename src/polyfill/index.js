const glob = require('glob')
const path = require('path')

glob
  .sync(`${path.resolve(__dirname)}/*.js`, { ignore: __filename })
  .map(_path => require(_path))
