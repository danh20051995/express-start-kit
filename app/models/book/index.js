/**
* File name: model.js
* Created by Visual studio code
* User: Danh Le / danh.danh20051995@gmail.com
* Date: 2019-01-18 17:53:23
*/

/**
* Module dependencies.
*/
import mongoose, { Schema } from 'mongoose'
import { schema, options } from './schema'

/**
* Schemas
*/
const BookSchema = new Schema(schema, options)

// BookSchema.virtual('authorInfo', {
//   ref: 'User',
//   localField: 'author',
//   foreignField: '_id',
//   justOne: true
// })

export default mongoose.model('Book', BookSchema)
