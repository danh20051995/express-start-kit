import { v4 as uuidV4 } from 'uuid'
import { Op } from 'sequelize'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import moment from 'moment'
import Config from 'config'
import { TokenModel, UserModel, AdministratorModel } from '@/database/models'

const _jwtSecret = Config.get('jwt.secret')
const _saltOrRounds = 10
const _expireIn = { days: 7 }
const _canRefreshIn = { months: 12 }

export class AuthenticateService {
  /**
   * SECTION: private properties
   */
  #_ref
  #_profile
  #_timestamp

  tokenType = 'Bearer'
  static tokenType = 'Bearer'

  /**
   * @param {{
   *   ref?: 'userId'|'adminId'
   * }}
   */
  constructor ({ ref = 'userId' }) {
    this.#_ref = ref
    this.#_timestamp = new Date()

    this.token = ''
    this.tokenExpireAt = moment(this.#_timestamp).add(_expireIn)
    this.tokenExpireIn = Math.abs(moment(this.#_timestamp).diff(this.tokenExpireAt, 's'))
    this.refreshToken = ''
    this.refreshTokenExpireAt = moment(this.#_timestamp).add(_canRefreshIn)
    this.refreshTokenExpireIn = Math.abs(moment(this.#_timestamp).diff(this.refreshTokenExpireAt, 's'))
  }

  /**
   * START: static methods
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
   * @param {{ type: 'tokenKey'|'tokenId', value: string }} payload
   * @param {string} secret
   * @returns {string} jwtToken
   */
  static sign (payload, secret = _jwtSecret) {
    return jwt.sign(payload, secret)
  }

  /**
   * @param {{
   *   jwtToken: string
   *   secret?: string
   *   isRefresh?: boolean
   * }} verify information
   * @returns {string} tokenKey|tokenId
   */
  static verify ({ jwtToken, secret = _jwtSecret, isRefresh = false }) {
    const data = jwt.verify(jwtToken, secret)
    if (!data || !data.value) {
      throw new Error('Unauthorized')
    }

    if (isRefresh && data.type !== 'tokenId') {
      throw new Error('Unauthorized')
    }

    return data.value
  }

  /**
   * @param {string} key token key
   */
  static async getCredentials (key) {
    const _now = new Date()
    const role = key.match(/credentials:([a-zA-Z]{1,}):/)[1]

    const conditions = {
      key,
      expiredAt: { [Op.gt]: _now }
    }

    const include = [{
      model: role === 'user' ? UserModel : AdministratorModel,
      as: role === 'user' ? 'user' : 'administrator',
      required: true
    }]

    const token = await TokenModel.findOne({
      where: conditions,
      include
    })

    if (!token) {
      throw new Error('Unauthorized')
    }

    const artifacts = {
      tokenKey: token.key,
      tokenId: token.id,
      ref: role
    }

    const credentials = {
      ...AuthenticateService.createCredentials(token.administrator || token.user),
      roles: [role]
    }

    return { artifacts, credentials }
  }

  /**
   * @param {object} ModelInstance
   * @returns {object} credentials
   */
  static createCredentials (profileInstance) {
    const {
      password,
      createdAt,
      updatedAt,
      deletedAt,
      ...credentials
    } = typeof profileInstance.toJSON === 'function'
      ? profileInstance.toJSON()
      : profileInstance

    return credentials
  }

  /**
   * @param {string} jwtToken Bearer authentication token
   */
  static async auth (jwtToken) {
    const tokenKey = AuthenticateService.verify({ jwtToken })
    const { artifacts, credentials } = await AuthenticateService.getCredentials(tokenKey)

    return {
      isAuthenticated: true,
      credentials,
      artifacts
    }
  }

  /**
   * Expire all activate tokens
   * @param {object} user Administrator or User instance
   * @returns {Promise}
   */
  static async cleanAllCredentials (user, exceptConditions = {}) {
    const _now = new Date()
    const conditions = {
      ...exceptConditions,
      type: TokenModel.__TYPE.AUTHENTICATE,
      // expiredAt: { [Op.gt]: _now },
      refreshExpiredAt: { [Op.gt]: _now },
      [Op.or]: [
        { userId: user.id },
        { adminId: user.id }
      ]
    }

    await TokenModel.update(
      { expiredAt: _now },
      { where: conditions }
    )
  }

  /**
   * SECTION: class methods
   */

  /**
   * Verify password
   * @param {{
   *   profile: object
   *   password: string
   *   encrypted: string
   *   ip: string
   *   os: string
   *   device: string
   * }} data authenticate credentials
   */
  async login ({ profile, password, encrypted, ip, os, device } = {}) {
    if (encrypted) {
      const validPassword = AuthenticateService.valid(password, encrypted)
      if (!validPassword) {
        throw new Error('Invalid credentials')
      }
    }

    this.#_profile = profile

    await this.createToken({ ip, os, device })

    return this
  }

  /**
   * Create token record in database
   * @param {User|Administrator} profile
   * @returns {AuthenticateService}
   */
  async createToken (information) {
    const token = new TokenModel({
      ...information,
      type: TokenModel.__TYPE.AUTHENTICATE,
      [this.#_ref]: this.#_profile.id,
      expiredAt: this.tokenExpireAt,
      refreshExpiredAt: this.refreshTokenExpireAt
    })

    token.key = [
      'credentials',
      this.#_ref.replace(/Id$/gi, ''),
      moment(this.#_timestamp).format('YYYY:MM:DD'),
      this.#_profile.id,
      uuidV4()
    ].filter(Boolean).join(':')

    this.token = token.token = AuthenticateService.sign({
      type: 'tokenKey',
      value: token.key
    })

    this.refreshToken = token.refreshToken = AuthenticateService.sign({
      type: 'tokenId',
      value: token.id
    })

    await token.save()

    return this
  }
}
