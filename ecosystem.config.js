require('dotenv').config()

const Pack = require('./package.json')
const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'staging'
const projectName = Pack.name

module.exports = {
  apps: [
    {
      name: `${projectName}:${PORT}`,
      script: 'npm',
      args: 'run serve',
      // watch: false,
      // instances: 'max',
      // exec_mode: 'cluster',
      // log_file: `./pm2logs/${projectName}_outerr.log`,
      // error_file: `./pm2logs/${projectName}_error.log`,
      // out_file: `./pm2logs/${projectName}_output.log`,
      env: {
        PORT,
        NODE_ENV
      }
    }
  ]
}
