/**
 * File name: schema.js
 * Created by Visual studio code
 * User: Danh Le / danh.danh20051995@gmail.com
 * Date: 2019-01-18 17:38:23
 */
const schema = {
  username: {
    type: String,
    trim: true,
    uppercase: true,
    unique: 'User already exists',
    required: 'Please enter username!'
  },
  email: {
    type: String,
    trim: true,
    unique: 'Email already exists',
    required: 'Please enter email!'
  },
  avatar: {
    type: String
  },
  password: {
    type: String,
    trim: true,
    required: 'Please enter password!'
  },
  status: {
    type: String,
    default: 'active',
    enum: [ 'active', 'inactive', 'archive' ]
  },
  roles: {
    type: [{
      type: String,
      enum: [ 'user', 'admin', 'super-admin' ]
    }],
    default: [ 'user' ]
  }
}

const options = {
  collection: 'users',
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}

export {
  schema,
  options
}
