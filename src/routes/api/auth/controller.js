import { HTTP } from '@/utils/http'
import { RedisService } from '@/services/redis'
import { AuthenticateService } from '@/services/authenticate'
import { UserModel, TokenModel } from '@/database/mongo/models'

export const login = async (req, res) => {
  const conditions = {
    status: UserModel.__STATUS.ACTIVE,
    $or: [
      { email: req.body.username },
      { username: req.body.username }
    ]
  }

  const user = await UserModel.findOne(conditions)
  if (!user) {
    throw new HTTP(HTTP._CODE.BAD_REQUEST, 'Invalid credentials')
  }

  const authenticateService = new AuthenticateService({
    ref: 'userId',
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
    profile: user,
    password: req.body.password,
    encrypted: user.password
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

export const profile = req => req.auth.credentials

export const logout = async (req, res) => {
  const _now = new Date()
  const { redisKey, tokenId } = req.auth.artifacts
  await Promise.all([
    RedisService.del(redisKey),
    TokenModel.updateOne({
      _id: tokenId,
      expiredAt: { $gt: _now }
    }, { $set: { expiredAt: _now } })
  ])

  return res
    .status(HTTP._CODE.NO_CONTENT)
    .send()
}

export const refreshToken = async (req, res) => {
  console.log(req.headers)
  res.status(HTTP._CODE.CREATED)
  return {}
}
