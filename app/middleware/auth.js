/**
* File name: auth.js
* Created by Visual studio code
* User: Danh Le / danh.danh20051995@gmail.com
* Date: 2019-01-18 17:37:54
*/
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
const User = mongoose.model('User')
const config = global.CONFIG

module.exports = async (req, res, next) => {
  let jwtToken = req.cookies.token

  if (jwtToken) {
    try {
      let secret = config.get('jwt.secret')
      let { _id } = jwt.verify(jwtToken, secret)
      let user = await User.findOne({ _id })
      if (user) {
        req.auth = user
        res.locals.auth = user
      }
    } catch (error) {
      console.log('jwt: ', error)
    }
  }

  return next()
}
