/**
 * File name: mongo.js
 * Created by Visual studio code
 * User: Danh Le / danh.danh20051995@gmail.com
 * Date: 2019-01-18 17:37:41
 */
import mongoose from 'mongoose'

const mongoosePaginate = require('./mongoose-paginate')

module.exports = async () => {
  mongoose.set('useCreateIndex', true)
  // mongoose.set('useUnifiedTopology', true)
  mongoose.plugin(mongoosePaginate)

  mongoose.connection.on('connecting', () => {
    console.info('Connecting to MongoDB...')
  })

  mongoose.connection.on('reconnected', () => {
    console.info('MongoDB reconnected!')
  })

  mongoose.connection.on('error', (error) => {
    console.error(`MongoDB connection error: ${error}`)
    mongoose.disconnect()
  })

  mongoose.connection.on('disconnected', () => {
    console.error(`MongoDB disconnected! Reconnecting in ${5000 / 1000}s...`)
    setTimeout(connect, 5000)
  })

  function connect () {
    mongoose.connect(global.CONFIG.get('db.uri'), {
      useNewUrlParser: true
    })
  }

  connect()
}
