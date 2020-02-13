module.exports = {
  apps: [
    {
      name: 'express-api',
      script: 'npm',
      args: 'run production',
      // watch: false,
      // instances: 'max',
      // exec_mode: 'cluster',
      // log_file: './pm2logs/express_outerr.log',
      // error_file: './pm2logs/express_error.log',
      // out_file: './pm2logs/express_output.log',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
