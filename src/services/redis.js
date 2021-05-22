import IORedis from 'ioredis'
import { Config } from '@/config'

const redisOptions = Config.get('redis')

export const RedisService = new IORedis({
  ...redisOptions,
  retryStrategy (times) {
    RedisService.ready = false
    return Math.max(times * 100, 2000)
  }
})

RedisService.on('error', error => {
  console.log('REDIS Error: ', error)
})

RedisService.on('ready', () => {
  RedisService.ready = true
  console.log('REDIS READY')
})

RedisService.on('connect', () => {
  console.log('REDIS Connected')
})

/**
 * Custom methods
 */
// https://redis.io/commands/scan
/**
 * @param {string} pattern
 * @param {number} cursor
 * @param {any[]} result
 * @returns {any[]} Redis keys
 */
RedisService.scanAllKeys = async function scanAllKeys (pattern, cursor = 0, result = []) {
  const [newCur, keys] = await RedisService.scan(
    cursor,
    'MATCH',
    RedisService.options.keyPrefix
      ? `${RedisService.options.keyPrefix}${pattern}`
      : pattern
  )
  result = [...result, ...keys]
  if (Number(newCur) === 0) {
    return result
  }

  return scanAllKeys(pattern, newCur, result)
}

RedisService.isReady = () => new Promise(resolve => {
  const waiting = setInterval(() => {
    if (RedisService.ready) {
      clearInterval(waiting)
      return resolve(1)
    }
  }, 100)
})

// RedisService.isReady().then(() => {
//   console.log(RedisService.options.keyPrefix)
//   console.log(RedisService.scanAllKeys('*'))
// })
