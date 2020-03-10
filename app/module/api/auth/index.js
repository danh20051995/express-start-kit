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
router.post('/login', [ Auth.valid('guest'), validate(Validate.login) ], Controller.login)

/* logout */
router.delete('/logout', Auth.valid('user'), Controller.logout)

/* get auth information */
router.get('/auth', Auth.valid('user'), Controller.sysAccount)

module.exports = router
