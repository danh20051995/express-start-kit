/**
* File name: index.js
* Created by Visual studio code
* User: Danh Le / danh.danh20051995@gmail.com
* Date: 2019-01-18 17:37:37
*/
import Path from 'path'
import glob from 'glob'
import express from 'express'
import cors from 'cors'
import nunjucks from 'nunjucks'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import flash from 'connect-flash'
import boom from 'express-boom'
import File from '_utils/file'

const config = global.CONFIG

let dirs = config.get('upload')
for (let key of Object.keys(dirs)) {
  File.ensureDirExists(dirs[key])
}

module.exports = async app => {
  // step by step

  // redis
  require('../lib/redis')()

  // mongoDB
  require('../lib/mongo')()

  // auto load models
  let models = glob.sync(global.BASE_PATH + '/app/model/*/index.js', {})
  for (let model of models) {
    require(Path.resolve(model))
  }

  // allow cross site origin
  app.use(cors())

  // boom response
  app.use(boom())

  // static files
  app.use('/files', express.static('public/files'))
  app.use('/api/files', express.static('public/files'))

  // setup view-engine and views global, filter
  app.set('view engine', 'html')
  require(Path.join(global.BASE_UTIL, 'views'))(nunjucks.configure(global.BASE_VIEW, {
    express: app,
    autoescape: true,
    watch: true,
    tags: {
      blockStart: '{%',
      blockEnd: '%}',
      variableStart: '{{',
      variableEnd: '}}',
      commentStart: '{#',
      commentEnd: '#}'
    }
  }))

  // support parsing of application/json type post data
  app.use(bodyParser.json())
  // support parsing of application/x-www-form-urlencoded post data
  app.use(bodyParser.urlencoded({ extended: true }))

  // support cookie
  app.use(cookieParser(config.get('session.secret')))

  // session and flash
  app.set('trust proxy', 1) // trust first proxy
  app.use(session(config.get('session')))
  app.use(flash())

  // load middleware
  let middleware = glob.sync(global.BASE_PATH + `/app/middleware/*.js`, {})
  for (let middle of middleware) {
    app.use(require(Path.resolve(middle)))
  }

  // auto load web modules
  let apiModules = glob.sync(global.BASE_PATH + `/app/module/web/*/index.js`, {})
  for (let mod of apiModules) {
    app.use('/', require(Path.resolve(mod)))
  }

  // auto  load api modules
  let webModules = glob.sync(global.BASE_PATH + `/app/module/api/*/index.js`, {})
  for (let mod of webModules) {
    app.use(
      config.get('context.apiPrefix'),
      require(Path.resolve(mod))
    )
  }

  // setup error
  require('../module/error')(app)
}
