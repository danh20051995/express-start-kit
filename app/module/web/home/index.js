/**
* File name: index.js
* Created by Visual studio code
* User: Danh Le / danh.danh20051995@gmail.com
* Date: 2019-01-18 17:39:11
*/
import express from 'express'
import Controller from './controller'

const router = express.Router()

router.get('/', Controller.home)

module.exports = router
