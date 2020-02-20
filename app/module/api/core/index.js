/**
* File name: index.js
* Created by Visual studio code
* User: Danh Le / danh.danh20051995@gmail.com
* Date: 2019-01-18 17:38:33
*/
import multer from 'multer'
import express from 'express'
// import validate from 'express-validation'

// import Validate from './validate'
import Controller from './controller'
import Middleware from './middleware'

const config = global.CONFIG
const router = express.Router()
const upload = multer({ dest: config.get('upload.tmp') })

router.get('/test', Controller.getTest)
router.post('/test', Controller.postTest)

router.post('/upload', [ upload.single('file'), Middleware.moveFile('single', config.get('upload.path')) ], Controller.postTest)
router.post('/uploads', [ upload.array('files'), Middleware.moveFile('array', config.get('upload.path')) ], Controller.postTest)
router.post('/uploadss', [ upload.fields([
  { name: 'file' },
  { name: 'files' }
]), Middleware.moveFile('fields', config.get('upload.path')) ], Controller.postTest)

module.exports = router
