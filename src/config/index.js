/** load config */
process.env.NODE_CONFIG_DIR = __dirname

/**
 * @typedef {Required<import('./default')>} ConfigValues
 * @typedef {keyof ConfigValues} ConfigKeys
 */

/**
 * @typedef {{
 *   get<T extends ConfigKeys>(key: T): ConfigValues[T]
 *   has<T extends ConfigKeys>(key: T): boolean
 * }} ConfigMethod
 */

/**
 * @type {ConfigValues & ConfigMethod}
 */
export const Config = require('config')
