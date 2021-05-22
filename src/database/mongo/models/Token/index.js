/**
 * Module dependencies.
 */
import mongoose, { Schema } from 'mongoose'
import { _TYPE, schema, options } from './schema'

/**
 * Schemas
 */
const TokenSchema = new Schema(schema, options)

/**
 * statics
 */
TokenSchema.statics._TYPE = _TYPE

/**
  * methods
  */
TokenSchema.methods._TYPE = _TYPE

export const TokenModel = mongoose.model('Token', TokenSchema)
