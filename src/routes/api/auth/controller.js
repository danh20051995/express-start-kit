import { Op } from 'sequelize'
import { HTTP } from '@/bootstrap/kernel/http'
import { AuthenticateService } from '@/services/authenticate'
import { UserModel, TokenModel } from '@/database/models'

export const login = async (req, res) => {
  const conditions = {
    status: UserModel.__STATUS.ACTIVE,
    phone: req.body.phone
  }

  const user = await UserModel.findOne({ where: conditions })
  if (!user) {
    throw new HTTP(
      HTTP._CODE.BAD_REQUEST,
      'Invalid credentials'
    )
  }

  const isValidPassword = AuthenticateService.valid(
    req.body.password,
    user.password
  )
  if (!isValidPassword) {
    throw new HTTP(
      HTTP._CODE.BAD_REQUEST,
      'Invalid credentials'
    )
  }

  const authenticateService = new AuthenticateService({ ref: 'userId' })
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
      ...user.toJSON(),
      roles: ['user']
    },
    ip: req.ip,
    os: req.body.os,
    device: req.body.device
  })

  // one session for user on a time | must be clean all another token
  res.on('finish', () => {
    // async | update activate credentials
    AuthenticateService.cleanAllCredentials(user, {
      token: {
        [Op.ne]: token
      }
    })
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
      model: UserModel,
      as: 'user',
      required: true
    }]
  })
  if (!currentToken) {
    throw new HTTP(
      HTTP._CODE.BAD_REQUEST,
      'Token invalid'
    )
  }

  const { user } = currentToken
  const authenticateService = new AuthenticateService({ ref: 'userId' })
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
      ...user.toJSON(),
      roles: ['user']
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

export const profile = req => req.auth.credentials
