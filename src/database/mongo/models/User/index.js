/**
 * Module dependencies.
 */
import { AuthenticateService } from '@/services/authenticate'
import mongoose, { Schema } from 'mongoose'
import { __STATUS, schema, options } from './schema'

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
 * statics
 */
UserSchema.statics.__STATUS = __STATUS
UserSchema.statics.generateHash = password => AuthenticateService.hash(password)

/**
 * methods
 */
UserSchema.methods.__STATUS = __STATUS
UserSchema.methods.generateHash = password => AuthenticateService.hash(password)
UserSchema.methods.validPassword = function (password) {
  return AuthenticateService.valid(password, this.password)
}

export const UserModel = mongoose.model('User', UserSchema)
