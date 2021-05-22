import moment from 'moment'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Config } from '@/config'
import { RedisService } from '@/services/redis'

const _jwtSecret = Config.get('jwt.secret')
const _saltOrRounds = 10
const _expireIn = { days: 7 }
const _canRefreshIn = { months: 1 }

const DefaultConfig = {}

export class AuthenticateService {
  /**
   * private properties
   */
  #_ref
  #_profile
  #_timestamp
  #_token
  #_tokenModel

  /**
   * private properties
   */
  tokenType = 'Bearer'

  /**
   * private properties
   */
  static tokenType = 'Bearer'

  /**
   * @param {{
   *   ref?: 'userId'|'adminId',
   *   TokenModel: DatabaseModel
   * }}
   */
  constructor ({ ref = 'userId', TokenModel = DefaultConfig.TokenModel }) {
    if (!TokenModel) {
      throw new Error('TokenModel is required')
    }

    this.#_ref = ref
    this.#_timestamp = new Date()
    this.#_tokenModel = TokenModel

    this.token = ''
    this.tokenExpireAt = moment(this.#_timestamp).add(_expireIn)
    this.tokenExpireIn = Math.abs(moment(this.#_timestamp).diff(this.tokenExpireAt, 's'))
    this.refreshToken = ''
    this.refreshTokenExpireAt = moment(this.#_timestamp).add(_canRefreshIn)
    this.refreshTokenExpireIn = Math.abs(moment(this.#_timestamp).diff(this.refreshTokenExpireAt, 's'))
  }

  static setDefaultTokenModel (TokenModel) {
    DefaultConfig.TokenModel = TokenModel
  }

  /**
   * SECTION: statics
   */

  /**
   * @param {string} password The password to be encrypted.
   * @returns {string}
   */
  static hash (password) {
    return bcrypt.hashSync(password, _saltOrRounds)
  }

  /**
   * @param {string} password The password to be encrypted.
   * @param {string} encrypted The password to be compared against.
   * @returns {boolean}
   */
  static valid (password, encrypted) {
    return bcrypt.compareSync(password, encrypted)
  }

  /**
   * @param {{ payload: string, secret?: string, isRefresh?: boolean }}
   * @returns {string} jwtToken
   */
  static sign ({ payload, secret = _jwtSecret, isRefresh } = {}) {
    const prefix = isRefresh ? 'refresh-token-id:' : ''
    return jwt.sign(`${prefix}${payload}`, secret)
  }

  /**
   * @param {{ jwtToken: string, secret?: string, isRefresh?: boolean }} data verify information
   * @returns {string} redis key or token _id
   */
  static verify ({ jwtToken, secret = _jwtSecret, isRefresh } = {}) {
    const key = jwt.verify(jwtToken, secret)
    if (!key) {
      throw new Error('Unauthorized')
    }

    if (isRefresh) {
      if (!key.startsWith('refresh-token-id:')) {
        throw new Error('Unauthorized')
      }

      return key.replace('refresh-token-id:', '')
    }

    return key
  }

  /**
   *
   * @param {string} redisKey auth redis key
   * @returns {object} credentials
   */
  static async getCredentials (redisKey) {
    const credentials = await RedisService.get(redisKey)
    if (!credentials) {
      throw new Error('Unauthorized')
    }
    return JSON.parse(credentials)
  }

  /**
   * @param {string} redisKey auth redis key
   * @returns {{ redisKey: string, tokenId: string, ref: string }} artifacts
   */
  static getArtifacts (redisKey) {
    const splitKey = redisKey.split(':')
    const tokenId = splitKey.pop()
    const ref = redisKey.match(/credentials:([a-zA-Z]{1,}):/)[1]
    return {
      redisKey,
      tokenId,
      ref
    }
  }

  /**
   * Verify password
   * @param {{
   *   profile: object,
   *   password: string,
   *   encrypted: string
   * }} data authenticate credentials
   */
  async login ({ profile, password, encrypted } = {}) {
    const validPassword = AuthenticateService.valid(password, encrypted)
    if (!validPassword) {
      throw new Error('Invalid credentials')
    }

    this.#_profile = profile
    await this.createToken()
    await this.cache()
    return this
  }

  /**
   * SECTION: methods
   */

  /**
   * Create token record in database
   * @param {User|Administrator} profile
   * @returns {AuthenticateService}
   */
  async createToken () {
    const TokenModel = this.#_tokenModel
    const token = new TokenModel({
      type: TokenModel._TYPE.AUTHENTICATE,
      [this.#_ref]: this.#_profile._id,
      expiredAt: this.refreshTokenExpireAt
    })

    token.key = [
      'credentials',
      this.#_ref.replace(/Id$/gi, ''),
      moment(this.#_timestamp).format('YYYY:MM:DD'),
      this.#_profile._id,
      token._id
    ].join(':')

    this.token = token.token = AuthenticateService.sign({
      payload: token.key
    })
    this.refreshToken = token.refreshToken = AuthenticateService.sign({
      payload: token._id,
      isRefresh: true
    })
    await token.save()
    this.#_token = token

    return this
  }

  async cache () {
    const {
      password,
      createdAt,
      updatedAt,
      deletedAt,
      ...credentials
    } = this.#_profile.toJSON()

    await RedisService.set(
      this.#_token.key,
      JSON.stringify({
        ...credentials,
        ref: this.#_ref
      }),
      'EX',
      this.tokenExpireIn
    )

    return this
  }
}
