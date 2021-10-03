import fs from 'fs'
import path from 'path'
import Busboy from 'busboy'
// import { inspect } from 'util'

const _cwd = process.cwd()
const _options = {
  tempDir: path.join(_cwd, 'temp')
}

/**
 * Random string by length
 * @param {number} length
 * @param {boolean} noLowerCase
 * @param {boolean} noUpperCase
 * @param {boolean} noNumber
 * @returns {string}
 */
const randStr = (length = 9, noLowerCase, noUpperCase, noNumber) => {
  const lowers = 'abcdefghijklmnopqrstuvwxyz'
  const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const chars = `${noLowerCase ? '' : lowers}${noUpperCase ? '' : uppers}${noNumber ? '' : numbers}`
  let str = ''

  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)]
  }

  return str
}

/**
 * Recursive create directory if not exists,
 * root path is current working directory
 * @param {string} directory
 * @returns {void}
 */
const ensureDirExists = directory => {
  return !directory
    .replace(process.cwd(), '')
    .split(/\\|\//)
    .reduce(({ fullPath, notEnsure }, part, index, paths) => {
      if (part) {
        fullPath = path.join(fullPath, part)
      }
      return {
        fullPath,
        notEnsure: !fs.existsSync(fullPath) && fs.mkdirSync(fullPath)
      }
    }, { fullPath: process.cwd(), notEnsure: false })
    .notEnsure
}

const removeUploadedFiles = files => {
  for (const { destination } of files) {
    fs.unlinkSync(destination)
  }
}

const requestHandler = (req, res, next) => {
  const isMultipart = String(req.headers['content-type']).startsWith('multipart/form-data;')

  if (!isMultipart || !['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return next()
  }

  /**
   * @param {string} field
   * @param {any} value
   * @returns {void}
   */
  const appendFieldToBody = (field, value) => {
    if (req.body[field]) {
      if (!Array.isArray(req.body[field])) {
        req.body[field] = [
          req.body[field]
        ]
      }
      req.body[field].push(value)
      return
    }

    req.body[field] = value
  }

  /**
   * process request body with busboy
   */
  const settledPromises = []
  const busboy = new Busboy({ headers: req.headers })

  busboy.on('file', function (fieldname, file, originalname, encoding, mimetype) {
    const _ext = path.extname(originalname)

    const filename = `${randStr(5)}-${new Date().getTime()}${_ext}`
    const destination = path.join(_options.tempDir, filename)

    const fileInfo = {
      size: 0,
      path: _options.tempDir,
      filename,
      encoding,
      mimetype,
      // fieldname,
      destination,
      originalname
    }

    settledPromises.push(
      Promise.settled(
        (resolve, reject) => {
          // Create a write stream of the new file
          const fStream = fs.createWriteStream(path.join(process.cwd(), 'temp', filename))
          // Pipe it trough
          file.pipe(fStream)

          // On error of the upload
          fStream.on('error', reject)

          // On finish of the upload
          fStream.on('close', () => {
            const { size } = fs.statSync(fileInfo.destination)
            appendFieldToBody(fieldname, { ...fileInfo, size })
            resolve({ ...fileInfo, size })
          })
        }
      )
    )
  })

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    appendFieldToBody(fieldname, val)
  })

  // busboy.on('error', error => {
  //   // TODO: remove uploaded files
  //   // TODO: next(error)
  // })
  // busboy.on('partsLimit', () => {
  //   // TODO: remove uploaded files
  //   // TODO: next(error)
  // })
  // busboy.on('filesLimit', () => {
  //   // TODO: remove uploaded files
  //   // TODO: next(error)
  // })
  // busboy.on('fieldsLimit', () => {
  //   // TODO: remove uploaded files
  //   // TODO: next(error)
  // })

  busboy.on('finish', function () {
    if (!settledPromises.length) {
      return next()
    }

    Promise
      .all(settledPromises)
      .then(values => {
        const { files, errors } = values.reduce(
          ({ files, errors }, { status, value, reason }) => ({
            files: status === 'fulfilled' ? [...files, value] : files,
            errors: status === 'rejected' ? [...errors, reason] : errors
          }),
          {
            files: [],
            errors: []
          }
        )

        res.on('close', () => removeUploadedFiles(files))

        if (errors.length) {
          return next(errors[0])
        }

        return next()
      })
  })

  req.pipe(busboy)
}

/**
 * Handler multipart/form-data; file upload and merge to req.body
 * @param {object} options
 * @returns {void}
 */
export const multipartHandler = (options = _options) => {
  Object.assign(_options, options)
  ensureDirExists(_options.tempDir)
  return requestHandler
}
