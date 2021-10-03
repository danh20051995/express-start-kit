'use strict'

const Package = require('@/../package')
const {
  PORT = 3000,

  DB_DIALECT,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,

  JWT_SECRET
} = process.env

module.exports = Object.freeze({
  package: Package,
  connection: {
    port: PORT,
    domain: `http://localhost:${PORT}`,
    timeout: 30000 // 30s
  },
  db: {
    dialect: DB_DIALECT,
    mysql: {
      dialect: DB_DIALECT,
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      url: `${DB_DIALECT}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`
    },
    postgresql: {
      dialect: DB_DIALECT,
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      url: `${DB_DIALECT}://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`
    }
  },
  mailer: {
    transport: {
      host: 'smtp.google.com',
      port: 587,
      tls: true,
      secure: false,
      logger: false, // log to console
      debug: false, // include SMTP traffic in the logs
      auth: {
        user: 'example@email.com',
        pass: '123456'
      }
    },
    defaults: {
      from: 'Develop <sender@example.com>'
    }
  },
  jwt: {
    secret: JWT_SECRET
  }
})
