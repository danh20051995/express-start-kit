import moment from 'moment'
import crypto from 'crypto'
import { Config } from '@/config'

/**
 * Hash md5, return string
 * @param {string} str
 * @returns {string}
 */
export const md5 = (str, digest = 'hex') => crypto
  .createHash('md5')
  .update(typeof str === 'string' ? str : String(str))
  .digest(digest)

/**
 * @param {number} time
 * @returns {Promise}
 */
export const sleep = time => new Promise(resolve => setTimeout(resolve, time))

/**
 * Check input is Array or not
 * @param {any} arr
 * @returns {boolean}
 */
export const isArray = arr => Array.isArray(arr)

/**
 * Check input is Object or not
 * @param {object} obj
 * @returns {boolean}
 */
export const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj)

/**
 * Valid input is an Array
 * @param {any} arr
 * @returns {Array}
 */
export const ensureArray = (arr, defaultValue) => isArray(arr) ? arr : isArray(defaultValue) ? defaultValue : []

/**
 * Valid input is an Object
 * @param {any} arr
 * @returns {object}
 */
export const ensureObject = (obj, defaultValue) => isObject(obj) ? obj : isObject(defaultValue) ? defaultValue : {}

export const dateFormat = (date, format = Config.get('date.format'), timeZone = '') => {
  try {
    const tmpDate = String(timeZone).match(/utc/i) ? moment.utc(date) : new Date(date)
    if (date && String(tmpDate) !== 'Invalid Date') {
      return String(timeZone).match(/utc/i) ? moment.utc(date).format(format) : moment(date).format(format)
    }
  } catch (error) {}

  return date
}

/**
 * Get first validate error message
 * @param {object} error
 * @returns {string}
 */
export const getFirstValidateError = error => {
  const { errors } = JSON.parse(error.toString())
  if (Array.isArray(errors) && errors.length) {
    const { messages } = errors[0]
    if (Array.isArray(messages) && messages.length) {
      return messages[0]
    }
  }

  return ''
}

/**
 * Random string
 * @param {number} length
 */
export const randStr = (length = 9, noLowerCase, noUpperCase, noNumber) => {
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
 * Convert Vietnamese to no sign
 * @param {string} str
 */
export const removeVietnameseSigns = str => String(str)
  .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
  .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
  .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
  .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
  .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
  .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
  .replace(/đ/g, 'd')
  .replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A')
  .replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E')
  .replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I')
  .replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O')
  .replace(/Ù|Ú|Ụ|Ủ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U')
  .replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y')
  .replace(/Đ/g, 'D')

/**
 * Make full text search for string field.
 * Use with sequelize: [Op.iRegexp]
 * @param {string} keyword
 * @returns {string}
 */
export const makeVietnameseFullTextSearch = keyword => {
  return removeVietnameseSigns(keyword)
    .replace(/  +/g, ' ')
    .replace(/a/gi, '[aáàảãạâấầẩẫậăắằẳẵặ]')
    .replace(/e/gi, '[eéèẻẽẹêếềểễệ]')
    .replace(/i/gi, '[iíìỉĩị]')
    .replace(/o/gi, '[oóòỏõọôốồổỗộơớờởỡợ]')
    .replace(/u/gi, '[uúùủũụưứừửữự]')
    .replace(/y/gi, '[yýỳỷỹỵ]')
    .replace(/d/gi, '[dđ]')

  // .replace(/  +/g, ' ')
  // .replace(/a/g, '[aáàảãạâấầẩẫậăắằẳẵặ]')
  // .replace(/e/g, '[eéèẻẽẹêếềểễệ]')
  // .replace(/i/g, '[iíìỉĩị]')
  // .replace(/o/g, '[oóòỏõọôốồổỗộơớờởỡợ]')
  // .replace(/u/g, '[uúùủũụưứừửữự]')
  // .replace(/y/g, '[yýỳỷỹỵ]')
  // .replace(/d/g, '[dđ]')
  // .replace(/A/g, '[AÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶ]')
  // .replace(/E/g, '[EÉÈẺẼẸÊẾỀỂỄỆ]')
  // .replace(/I/g, '[IÍÌỈĨỊ]')
  // .replace(/O/g, '[OÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ]')
  // .replace(/U/g, '[UÚÙỦŨỤƯỨỪỬỮỰ]')
  // .replace(/Y/g, '[YÝỲỶỸỴ]')
  // .replace(/D/g, '[DĐ]')
}

export default {
  md5,
  sleep,
  isArray,
  isObject,
  ensureArray,
  ensureObject,
  randStr,
  dateFormat,
  removeVietnameseSigns,
  makeVietnameseFullTextSearch,
  getFirstValidateError
}
