import moment from 'moment'
import { Config } from '@/config'

/**
 * @param {Number} time
 * @return {Promise}
 */
export const sleep = time => new Promise(resolve => setTimeout(resolve, time))

/**
  * Check input is Array or not
  * @param {Any} arr
  * @return {Boolean}
  */
export const isArray = arr => Array.isArray(arr)

/**
  * Check input is Object or not
  * @param {Any} obj
  * @return {Boolean}
  */
export const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj)

/**
  * Valid input is an Array
  * @param {Any} arr
  * @return {Array}
  */
export const ensureArray = (arr, defaultValue) => isArray(arr) ? arr : isArray(defaultValue) ? defaultValue : []

/**
  * Valid input is an Object
  * @param {Any} arr
  * @return {Object}
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
 * @param {Object} error
 * @return {String}
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
 * @param {Number} length
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

export default {
  sleep,
  isArray,
  isObject,
  ensureArray,
  ensureObject,
  randStr,
  dateFormat,
  getFirstValidateError
}
