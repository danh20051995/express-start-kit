/**
* File name: schema.js
* Created by Visual studio code
* User: Danh Le / danh.danh20051995@gmail.com
* Date: 2019-01-18 17:38:23
*/
// import { Schema } from 'mongoose'

const schema = {
  name: {
    type: String,
    required: 'Please enter name!'
  },
  description: {
    type: String
  },
  status: {
    type: String,
    default: 'active',
    enum: [ 'active', 'inactive', 'archive' ]
  },
  cover: {
    type: String // publib/files/cover
  },
  author: {
    type: String
  }
  // author: {
  //   type: Schema.ObjectId,
  //   ref: 'User'
  // }
}

const options = {
  collection: 'books',
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

export {
  schema,
  options
}
