export const __STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
}

export const schema = {
  username: {
    type: String,
    trim: true,
    lowercase: true,
    unique: 'User already exists',
    required: 'Please enter username!'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: 'Email already exists',
    required: 'Please enter email!'
  },
  password: {
    type: String,
    trim: true,
    required: 'Please enter password!'
  },
  status: {
    type: String,
    enum: Object.values(__STATUS),
    default: __STATUS.ACTIVE
  }
}

export const options = {
  collection: 'users',
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
}
