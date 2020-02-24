/**
* File name: controller.js
* Created by Visual studio code
* User: Danh Le / danh.danh20051995@gmail.com
* Date: 2019-01-18 17:38:55
*/
import Auth from '_utils/auth'
import mongoose from 'mongoose'
const User = mongoose.model('User')

/**
 * Login page
 * @param {Object} req
 * @param {Object} res
 * @return {Response}
 */
const getLogin = async (req, res) => {
  let flash = req.flash('oldLogin')
  let data = flash.length ? flash[0] : {}
  res.render('pages/login', data)
}

/**
 * User login
 * @param {Object} req
 * @param {Object} res
 * @return {Redirect}
 */
const postLogin = async (req, res) => {
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
    res.redirect('/')
  } catch (error) {
    req.flash('oldLogin', {
      payload: req.body,
      messages: error.message
    })
    res.redirect('back')
  }
}

/**
 * Register page
 * @param {Object} req
 * @param {Object} res
 * @return {Response}
 */
const getRegister = async (req, res) => {
  let flash = req.flash('oldRegister')
  let data = flash.length ? flash[0] : {}
  res.render('pages/register', data)
}

/**
 * Register new user
 * @param {Object} req
 * @param {Object} res
 * @return {Redirect}
 */
const postRegister = async (req, res) => {
  try {
    let payload = req.body

    let duplicate = await User
      .findOne({
        $or: [
          { email: payload.email },
          { username: payload.username }
        ]
      })
      .lean()

    if (duplicate) {
      throw new Error('Email or user name already exists.')
    }

    payload.password = await User.generateHash(payload.password)
    await User.create(payload)
    return res.redirect('/login')
  } catch (error) {
    req.flash('oldRegister', {
      payload: req.body,
      messages: error.message
    })
    res.redirect('back')
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
    res.redirect('/')
  } catch (error) {
    req.flash('error', error.message)
    res.redirect('/500')
  }
}

export default {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  logout
}
