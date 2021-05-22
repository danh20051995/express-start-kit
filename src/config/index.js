/** load config */
process.env.NODE_CONFIG_DIR = __dirname
export const Config = require('config')
export default Config
