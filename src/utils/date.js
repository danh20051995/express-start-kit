import moment from 'moment'

/**
 * Valid date from string with defined format
 * Throw exception if date is invalid
 * @param {string} date
 * @returns {string|never}
 */
export const validDateFormat = (date, format = 'YYYY-MM-DD') => {
  const result = moment(date, format)

  if (!result.isValid()) {
    throw new Error(`Invalid date for value ${result}`)
  }

  return date
}
