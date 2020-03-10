/**
 * File name: middleware.js
 * Created by Visual studio code
 * User: Danh Le / danh.danh20051995@gmail.com
 * Date: 2019-01-18 19:04:21
 */
import path from 'path'
import File from '_utils/file'
import { ValidationError } from 'express-validation'
const config = global.CONFIG
const uploadTypes = config.get('uploadTypes')

/**
 * Validate file type
 * @param {String} type
 * @param {String|Array|RegExp} accept
 */
const valid = (type, accept) => {
  if (accept instanceof RegExp) {
    return accept.test(type)
  }

  if (typeof accept === 'string' || Array.isArray(accept)) {
    return accept.includes(type)
  }

  return !accept
}

/**
 * multer upload single-file
 * @param {String} dest
 * @param {String|Array|RegExp} accept
 */
const single = (dest, accept = uploadTypes) => {
  return (req, res, next) => {
    if (req.file) {
      let ext = path.extname(req.file.originalname)
      if (!ext || !valid(ext.replace(/\./g, ''), accept)) {
        throw new ValidationError([ { messages: [ 'File type not-allow' ] } ], {})
      }

      let fileName = path.basename(req.file.originalname, ext) + '-' + new Date().getTime() + ext
      let destination = path.join(dest || req.file.destination, fileName)
      File.move(req.file.path, destination)
      req.body[req.file.fieldname] = fileName
    }

    next()
  }
}

/**
 * multer upload array-files
 * @param {String} dest
 * @param {String|Array|RegExp} accept
 */
const array = (dest, accept = uploadTypes) => {
  let validateType = files => {
    let invalid = files.some(f => {
      let ext = path.extname(f.originalname)
      if (!ext || !valid(ext.replace(/\./g, ''), accept)) {
        return true
      }
    })

    if (invalid) {
      throw new ValidationError([ { messages: [ 'File type not-allow' ] } ], {})
    }
  }

  return (req, res, next) => {
    if (req.files && req.files.length) {
      validateType(req.files)

      let { fieldname } = req.files[0]
      req.body[fieldname] = []

      for (const file of req.files) {
        let ext = path.extname(file.originalname)
        let fileName = path.basename(file.originalname, ext) + '-' + new Date().getTime() + ext
        let destination = path.join(dest || file.destination, fileName)
        File.move(file.path, destination)
        req.body[fieldname].push(fileName)
      }
    }

    next()
  }
}

/**
 * multer upload fields-files
 * @param {String} dest
 * @param {String|Array|RegExp} accept
 */
const fields = (dest, accept = uploadTypes) => {
  let validateType = files => {
    // convert all field-files to an array of files
    let allFiles = Object.values(files).reduce((r, f) => [ ...r, ...f ], [])

    let invalid = allFiles.some(f => {
      let ext = path.extname(f.originalname)
      if (!ext || !valid(ext.replace(/\./g, ''), accept)) {
        return true
      }
    })

    if (invalid) {
      throw new ValidationError([ { messages: [ 'File type not-allow' ] } ], {})
    }
  }

  return (req, res, next) => {
    if (req.files) {
      validateType(req.files)

      for (const field in req.files) {
        let files = req.files[field]
        if (files.length) {
          let { fieldname } = files[0]
          req.body[fieldname] = []

          for (const file of files) {
            let ext = path.extname(file.originalname)
            let fileName = path.basename(file.originalname, ext) + '-' + new Date().getTime() + ext
            let destination = path.join(dest || file.destination, fileName)
            File.move(file.path, destination)
            req.body[fieldname].push(fileName)
          }
        }
      }
    }

    next()
  }
}

const upload = {
  single,
  array,
  fields
}

/**
 * Upload file middleware
 * @param {String} type
 * @param {String} dest
 * @param {String|Array|RegExp} accept
 */
const moveFile = (type = 'single', dest, accept = uploadTypes) => {
  if (![ 'single', 'array', 'fields', 'any' ].includes(type)) {
    throw new Error('Upload type must in: ', [ 'single', 'array', 'fields', 'any' ].join(', '))
  }

  try {
    return upload[type](dest, accept)
  } catch (error) {
    throw new Error('Upload type must in: ', [ 'single', 'array', 'fields', 'any' ].join(', '))
  }
}

export default {
  single,
  array,
  fields,
  moveFile
}
