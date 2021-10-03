import { Op } from 'sequelize'
import { HTTP } from '@/bootstrap/kernel/http'
import { AuthenticateService } from '@/services/authenticate'
import { AdministratorModel, TokenModel } from '@/database/models'

export const login = async (req, res) => {
  const conditions = {
    status: AdministratorModel.__STATUS.ACTIVE,
    [Op.or]: [
      { email: req.body.username },
      { username: req.body.username }
    ]
  }

  const administrator = await AdministratorModel.findOne({ where: conditions })
  if (!administrator) {
    throw new HTTP(HTTP._CODE.BAD_REQUEST, 'Invalid credentials')
  }

  const authenticateService = new AuthenticateService({ ref: 'adminId' })
  const {
    tokenType,
    token,
    tokenExpireAt,
    tokenExpireIn,
    refreshToken,
    refreshTokenExpireAt,
    refreshTokenExpireIn
  } = await authenticateService.login({
    profile: {
      ...administrator.toJSON(),
      roles: ['admin']
    },
    password: req.body.password,
    encrypted: administrator.password,
    ip: req.ip,
    os: req.body.os,
    device: req.body.device
  })

  res.status(HTTP._CODE.CREATED)

  return {
    tokenType,
    token,
    tokenExpireAt,
    tokenExpireIn,
    refreshToken,
    refreshTokenExpireAt,
    refreshTokenExpireIn
  }
}

export const logout = async (req, res) => {
  const { tokenId } = req.auth.artifacts
  await TokenModel.expire(tokenId)
  return res.status(HTTP._CODE.NO_CONTENT).end()
}

export const refreshToken = async (req, res) => {
  const _now = new Date()
  const currentToken = await TokenModel.findOne({
    where: {
      refreshToken: req.body.refreshToken,
      expiredAt: { [Op.gt]: _now }
    },
    include: [{
      model: AdministratorModel,
      as: 'administrator',
      required: true
    }]
  })
  if (!currentToken) {
    throw new HTTP(
      HTTP._CODE.BAD_REQUEST,
      'Token invalid'
    )
  }

  const { administrator } = currentToken
  const authenticateService = new AuthenticateService({ ref: 'adminId' })
  const {
    tokenType,
    token,
    tokenExpireAt,
    tokenExpireIn,
    refreshToken,
    refreshTokenExpireAt,
    refreshTokenExpireIn
  } = await authenticateService.login({
    profile: {
      ...administrator.toJSON(),
      roles: ['admin']
    },
    ip: req.ip,
    os: currentToken.os,
    device: currentToken.device
  })

  res.status(HTTP._CODE.CREATED)
  res.on('close', () => currentToken.expire())

  return {
    tokenType,
    token,
    tokenExpireAt,
    tokenExpireIn,
    refreshToken,
    refreshTokenExpireAt,
    refreshTokenExpireIn
  }
}

export const getProfile = req => req.auth.credentials
