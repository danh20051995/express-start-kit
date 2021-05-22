'use strict'

const Pack = require(global.BASE_PATH + '/package')
const dbName = String(Pack.name).replace(/[ -_]/g, '_').toLowerCase()
const port = process.env.PORT || 3000
const {
  MONGO_DB_HOST = '127.0.0.1',
  MONGO_DB_PORT = '27017',
  // MONGO_DB_USERNAME = '',
  // MONGO_DB_PASSWORD = '',
  MONGO_DB_DATABASE = `db_${dbName}`,

  PG_DB_DIALECT = 'postgres',
  PG_DB_HOST = '127.0.0.1',
  PG_DB_PORT = '5432',
  PG_DB_USERNAME = 'postgres',
  PG_DB_PASSWORD = 'password',
  PG_DB_DATABASE = `db_${dbName}`,

  REDIS_HOST = '127.0.0.1',
  REDIS_PORT = 6379,

  JWT_SECRET = 'jKErFl345ghLoPrlafasTHdfgDsdf0werr'
} = process.env

module.exports = Object.freeze({
  name: Pack.name,
  connection: {
    port,
    domain: `http://localhost:${port}`
  },
  db: {
    mongo: {
      // uri: `mongodb://${MONGO_DB_USERNAME}:${MONGO_DB_PASSWORD}@${MONGO_DB_HOST}:${MONGO_DB_PORT}/${MONGO_DB_DATABASE}`
      uri: `mongodb://${MONGO_DB_HOST}:${MONGO_DB_PORT}/${MONGO_DB_DATABASE}`
    },
    postgresql: {
      dialect: PG_DB_DIALECT,
      host: PG_DB_HOST,
      port: PG_DB_PORT,
      username: PG_DB_USERNAME,
      password: PG_DB_PASSWORD,
      database: PG_DB_DATABASE,
      url: `${PG_DB_DIALECT}://${PG_DB_USERNAME}:${PG_DB_PASSWORD}@${PG_DB_HOST}:${PG_DB_PORT}/${PG_DB_DATABASE}`
    }
  },
  redis: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    keyPrefix: `${Pack.name}:`,
    detect_buffers: true
  },
  redisMQ: {
    // host: REDIS_HOST,
    // port: REDIS_PORT,
    interval: [0.1, 1], // wait 0.1s between every receive and step up to 1,3 on empty receives
    invisibletime: 2, // hide received message for 5 sec
    maxReceiveCount: 2, // only receive a message 2 times until delete
    autostart: true,
    redisPrefix: `${Pack.name}:`
  },
  jwt: {
    secret: JWT_SECRET
  },
  mailer: {
    options: {
      // pool: true,
      host: 'smtp.google.com',
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
  }
})
