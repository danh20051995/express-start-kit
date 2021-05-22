import { Op } from 'sequelize'
import { HTTP } from '@/utils/http'
import { RedisService } from '@/services/redis'
import { AuthenticateService } from '@/services/authenticate'
import { AdministratorModel, TokenModel } from '@/database/postgresql/models'

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

  const authenticateService = new AuthenticateService({
    ref: 'adminId',
    TokenModel
  })
  const {
    tokenType,
    token,
    tokenExpireAt,
    tokenExpireIn,
    refreshToken,
    refreshTokenExpireAt,
    refreshTokenExpireIn
  } = await authenticateService.login({
    profile: administrator,
    password: req.body.password,
    encrypted: administrator.password
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
  const _now = new Date()
  const { redisKey, tokenId } = req.auth.artifacts
  await Promise.all([
    RedisService.del(redisKey),
    TokenModel.update({ expiredAt: _now }, {
      where: {
        _id: tokenId,
        expiredAt: { [Op.gt]: _now }
      }
    })
  ])

  return res
    .status(HTTP._CODE.NO_CONTENT)
    .send()
}

export const profile = req => req.auth.credentials

export const refreshToken = async (req, res) => {
  console.log(req.headers)
  res.status(HTTP._CODE.CREATED)
  return {}
}
