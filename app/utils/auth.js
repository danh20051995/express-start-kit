/**
 * File name: util.js
 * Created by Visual studio code
 * User: Danh Le / danh.danh20051995@gmail.com
 * Date: 2019-01-18 17:39:15
 */
import JWT from 'jsonwebtoken'
import Bcrypt from 'bcrypt'

const config = global.CONFIG

/**
 * Compare password with hash string
 * @param {String} plainPassword
 * @param {String} hashPassword
 * @return {Promise}
 */
const compare = (plainPassword, hashPassword) => {
  return Bcrypt
    .compare(plainPassword, hashPassword)
    .then(valid => {
      if (valid) {
        return Promise.resolve(valid)
      }
      return Promise.reject(new Error('Invalid Password'))
    })
}

/**
 * Generate JWT token
 * @param {Object} user
 * @retunr {String}
 */
const createJwtToken = (user, remember) => {
  let exp = config.get('cookieOptions.ttl') * (remember ? 7 : 1) + new Date().getTime()
  return {
    expires: new Date(exp),
    token: JWT.sign({
      exp: Math.floor(exp / 1000), // https://www.npmjs.com/package/jsonwebtoken#token-expiration-exp-claim
      id: user._id,
      _id: user._id,
      email: user.email
    }, config.get('jwt.secret'))
  }
}

/**
 * Compare information, login and generate JWT token
 * @param {String} password
 * @param {Object} user
 * @param {Boolean} remember
 * @return {Promise}
 */
const login = (password, user, remember) => {
  return compare(password, user.password)
    .then(valid => createJwtToken(user, remember))
}

/**
 * Route auth valid
 * @param {String} role
 * @return {Promise}
 */
const valid = role => {
  let authFail = (req, res, next) => {
    if (req.baseUrl === '/api') {
      return res.boom.unauthorized()
    }
    return res.redirect('/login')
  }

  return async (req, res, next) => {
    switch (role) {
      case 'guest':
        if (req.auth) {
          return res.redirect('/')
        }
        break
      case 'user':
        if (!req.auth) {
          return authFail(req, res, next)
        }
        break
    }

    return next()
  }
}

export default {
  compare,
  login,
  valid
}
