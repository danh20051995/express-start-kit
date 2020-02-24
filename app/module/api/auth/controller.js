/**
* File name: controller.js
* Created by Visual studio code
* User: Danh Le / danh.danh20051995@gmail.com
* Date: 2019-01-18 19:50:42
*/
import Auth from '_utils/auth'
import mongoose from 'mongoose'

const User = mongoose.model('User')

/**
 * User login
 * @param {Object} req
 * @param {Object} res
 * @return {Redirect}
 */
const login = async (req, res) => {
  try {
    let payload = req.body
    let user = await User
      .findOne({
        $or: [
          { email: payload.user },
          { username: payload.user }
        ]
      })
      .lean()

    if (!user) {
      throw new Error('User not found.')
    }

    let { token, expires } = await Auth.login(payload.password, user, payload.remember)
    res.cookie('token', token, { expires })
    delete user.password

    return res.send(Object.assign(user, { token, expires }))
  } catch (error) {
    return res.boom.badRequest(error)
  }
}

/**
 * Auth logout
 * @param {Object} req
 * @param {Object} res
 * @return {Redirect}
 */
const logout = async (req, res) => {
  try {
    // await Auth.logout(req.auth.id)
    res.clearCookie('token')
    res.send({ success: true })
  } catch (error) {
    return res.boom.badRequest(error)
  }
}

/**
 * Function check auth
 * @return {Response}
 */
const sysAccount = async (req, res) => {
  try {
    let user = await User.findOne({ _id: req.auth.uid, status: { $ne: 'archive' } }).lean()
    if (user) {
      delete user.password
      return res.send(user)
    }

    return res.boom.notFound('User is not found')
  } catch (error) {
    return res.boom.badRequest(error)
  }
}

export default {
  login,
  logout,
  sysAccount
}
