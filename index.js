'use strict'

require('core-js')
require('@babel/register')
require('@babel/polyfill')
require('module-alias/register')

const os = require('os')
const path = require('path')
const express = require('express')
const app = express()

global.BASE_PATH = __dirname
global.BASE_MODEL = path.join(__dirname, '/app/models')
global.BASE_UTIL = path.join(__dirname, '/app/utils')
global.BASE_VIEW = path.join(__dirname, '/app/views')

// config first
process.env.NODE_CONFIG_DIR = path.join(__dirname, '/app/config')
global.CONFIG = require('config')

;(async () => {
  await require('./app/bootstrap')(app)
  let port = global.CONFIG.get('connection.port')
  app.listen(port, '0.0.0.0', () => console.log('App listening at http://%s:%s', os.hostname(), port))
})()
