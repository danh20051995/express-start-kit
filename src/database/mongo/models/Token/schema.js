import { Schema } from 'mongoose'

export const _TYPE = {
  AUTHENTICATE: 'authenticate',
  RESET: 'reset'
}

export const schema = {
  userId: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  adminId: {
    type: Schema.ObjectId,
    ref: 'Administrator'
  },
  type: {
    type: String,
    enum: Object.values(_TYPE),
    default: _TYPE.AUTHENTICATE
  },
  key: {
    type: String
  },
  token: {
    type: String
  },
  refreshToken: {
    type: String
  },
  fcmToken: {
    type: String
  },
  expiredAt: {
    type: Date
  }
}

export const options = {
  collection: 'tokens',
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}
