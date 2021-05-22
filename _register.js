require('dotenv').config()
require('module-alias/register')
require('@babel/register')

require('./_process.js')
require('./_global.js')

require('@/config')
