/**
 * File name: model.js
 * Created by Visual studio code
 * User: Danh Le / danh.danh20051995@gmail.com
 * Date: 2019-01-18 17:38:19
 */

/**
 * Module dependencies.
 */
import bcrypt from 'bcrypt'
import mongoose, { Schema } from 'mongoose'
import { schema, options } from './schema'

/**
 * Schemas
 */
const UserSchema = new Schema(schema, options)

/**
 * Indexes
 */
// UserSchema.index({ email: 1 }, { unique: true })
// UserSchema.index({ username: 1 }, { unique: true })

/**
 * Plugins
 */
UserSchema.statics.generateHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
UserSchema.methods.generateHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
UserSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

export default mongoose.model('User', UserSchema)
