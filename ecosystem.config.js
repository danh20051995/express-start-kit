module.exports = {
  apps: [
    {
      name: 'maua-api',
      script: 'npm',
      args: 'run production',
      // watch: false,
      // instances: 'max',
      // exec_mode: 'cluster',
      // log_file: './pm2logs/maua_outerr.log',
      // error_file: './pm2logs/maua_error.log',
      // out_file: './pm2logs/maua_output.log',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
