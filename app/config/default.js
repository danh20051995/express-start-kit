'use strict'

let config = {}
const Pack = require(global.BASE_PATH + '/package')

config = {
  name: Pack.name,
  connection: {
    port: 3001
  },
  db: {
    uri: 'mongodb://127.0.0.1:27017/db_express_start_kit'
  },
  session: {
    secret: '6ketaq3cgSDffg878fgo315rk9',
    resave: false,
    saveUninitialized: true,
    maxAge: 24 * 60 * 60 * 1000, // expires a day from today
    cookie: {
      secure: false, // true on https
      maxAge: 24 * 60 * 60 * 1000 // expires a day from today
    }
  },
  cookieOptions: {
    ttl: 24 * 60 * 60 * 1000, // expires a day from today
    encoding: 'none', // we already used JWT to encode
    isSecure: false, // warm & fuzzy feelings
    isHttpOnly: true, // prevent client alteration
    clearInvalid: false, // remove invalid cookies
    strictHeader: true, // don't allow violations of RFC 6265
    path: '/' // set the cookie for all routes
  },
  date: {
    format: 'MMM DD, YYYY'
  },
  paging: {
    defaultPageSize: 25,
    numberVisiblePages: 10,
    itemsPerPage: 20
  },
  redisOptions: {
    host: '127.0.0.1',
    port: 6379,
    detect_buffers: true
  },
  mailer: {
    options: {
      // pool: true,
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      auth: {
        user: 'example@email.com',
        pass: '123456'
      },
      logger: false, // log to console
      debug: false // include SMTP traffic in the logs
    },
    defaults: {
      from: 'Develop <sender@example.com>'
    }
  },
  upload: {
    commander: global.BASE_PATH + '/app/commander',
    path: global.BASE_PATH + '/public/files',
    tmp: global.BASE_PATH + '/public/files/tmp',
    bookCover: global.BASE_PATH + '/public/files/bookCover'
  },
  uploadTypes: [ 'jpg', 'jpeg', 'png', 'gif', 'pdf', 'docx', 'csv', 'pptx', 'xlsx', 'mp3', 'mp4', 'webm', 'mkv', 'flv', 'vob', 'ogv', 'ogg', 'drc', 'gifv', 'mng', 'avi', 'mov', 'qt', 'wmv', 'yuv', 'rm', 'rmvb', 'asf', 'amv', 'm4p', 'm4v', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'svi', '3gp', '3g2', 'mxf', 'roq', 'nsv', 'f4v', 'f4p', 'f4a', 'f4b' ],
  uploadMaxSize: 104857600, // 100MB
  jwt: {
    secret: 'jKErFl345ghLoPrlafasTHdfgDsdf0werr'
  },
  context: {
    apiPrefix: '/api',
    adminPrefix: '/admin',
    mobilePrefix: '/mobile'
  },
  social: {
    facebook: {
      lang: 'en_US',
      version: 'v3.2',
      appId: '0123456789'
    },
    google: {},
    twitter: {}
  }
}

module.exports = config
