/**
 * File name: views.js
 * Created by Visual studio code
 * User: Danh Le / danh.danh20051995@gmail.com
 * Date: 2019-01-18 17:39:20
 */
import { dateFormat } from './helpers'
const config = global.CONFIG

module.exports = env => {
  // global
  env.addGlobal('config', config)

  // filters
  env.addFilter('dateFormat', dateFormat)
  env.addFilter('stringify', (data, space = 2) => JSON.stringify(data, null, space))
}
