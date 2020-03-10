/**
 * File name: index.js
 * Created by Visual studio code
 * User: Danh Le / danh.danh20051995@gmail.com
 * Date: 2019-01-18 17:38:43
 */
import multer from 'multer'
import express from 'express'
import validate from 'express-validation'
import Auth from '_utils/auth'
import Controller from './controller'
import Validate from './validate'
import Middleware from '../core/middleware'

const config = global.CONFIG
const router = express.Router()
const upload = multer({ dest: config.get('upload.bookCover') })

// router.get('/books', [ Auth.valid('user') ], Controller.getItems)
router.get('/books', Controller.getItems)

router.get('/books/:_id', [ Auth.valid('user') ], Controller.getItem)

router.put('/books/:_id', [ Auth.valid('user'), upload.single('cover'), Middleware.moveFile(), validate(Validate.update) ], Controller.update)

router.post('/books', [ Auth.valid('user'), upload.single('cover'), Middleware.moveFile(), validate(Validate.store) ], Controller.store)

router.put('/books/:_id/status', [ Auth.valid('user'), validate(Validate.status) ], Controller.update)

router.delete('/books/:_id', [ Auth.valid('user') ], Controller.remove)

module.exports = router
