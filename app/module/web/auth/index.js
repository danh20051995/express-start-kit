/**
* File name: index.js
* Created by Visual studio code
* User: Danh Le / danh.danh20051995@gmail.com
* Date: 2019-01-18 17:38:59
*/
import express from 'express'
import validate from 'express-validation'
import Auth from '_utils/auth'
import Validate from './validate'
import Controller from './controller'
const router = express.Router()

/* login */
router.get('/login', Auth.valid('guest'), Controller.getLogin)
router.post('/login', [ Auth.valid('guest'), validate(Validate.postLogin) ], Controller.postLogin)

/* register */
router.get('/register', Auth.valid('guest'), Controller.getRegister)
router.post('/register', [ Auth.valid('guest'), validate(Validate.postRegister) ], Controller.postRegister)

/* logout */
router.get('/logout', Auth.valid('user'), Controller.logout)

module.exports = router
