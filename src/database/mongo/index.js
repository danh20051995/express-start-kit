import path from 'path'
import glob from 'glob'
import mongoose from 'mongoose'
import { Config } from '@/config'
import { paginatePlugin } from './plugins/paginate'

/* Apply mongoose global plugins */
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)
mongoose.plugin(paginatePlugin)

/** Auto load models */
glob
  .sync(`${path.resolve(__dirname)}/models/*/index.js`)
  .forEach(_mod => {
    require(_mod)
  })

/** Auto load seeders */
glob
  .sync(`${path.resolve(__dirname)}/seeders/*.js`)
  .forEach(_mod => {
    require(_mod)
  })

/** Connect to MongoDB */
export const connect = () => {
  const uri = Config.get('db.mongo.uri')
  const options = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }

  /** Handle mongoose connection events */
  mongoose.connection.on('connecting', () => {
    console.log('Connecting to Mongo...')
  })

  mongoose.connection.on('connected', () => {
    console.log('Mongo is connected.')
  })

  mongoose.connection.on('reconnected', () => {
    console.log('Mongo trying to reconnect...')
  })

  mongoose.connection.on('error', error => {
    console.error('Unable to connect to the Mongo: ', error)
  })

  mongoose.connection.on('disconnected', () => {
    console.log('Mongo has disconnected!')

    // Trying to connect
    const waitingMS = 5000
    setTimeout(() => {
      console.log(`Reconnecting in ${waitingMS / 1000}s...`)
      return mongoose.connect(uri, options)
    }, waitingMS)
  })

  return mongoose.connect(uri, options)
}

connect()
