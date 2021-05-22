import { AuthenticateService } from '@/services/authenticate'
import { HTTP } from '@/utils/http'
import { JsonWebTokenError } from 'jsonwebtoken'

const authenticate = async (jwtToken) => {
  const authentication = {
    isAuthenticated: false,
    credentials: {},
    artifacts: {}
  }

  const redisKey = AuthenticateService.verify({ jwtToken })
  authentication.artifacts = AuthenticateService.getArtifacts(redisKey)
  authentication.credentials = await AuthenticateService.getCredentials(redisKey)
  authentication.isAuthenticated = true
  return authentication
}

/**
 * Router authentication middleware
 * @param {any} authOptions
 * @returns {Function}
 */
export const handlerAuthentication = (authOptions) => async (req, res, next) => {
  req.auth = {
    isAuthenticated: false,
    credentials: {},
    artifacts: {
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    }
  }

  const authorization = req.headers.authorization
  if (authorization) {
    const [tokenType, jwtToken] = authorization.split(/\s+/)
    if (jwtToken && tokenType === AuthenticateService.tokenType) {
      const { isAuthenticated, credentials, artifacts } = await authenticate(jwtToken).catch(error => {
        if (!(error instanceof JsonWebTokenError)) {
          console.log(error)
        }
        return { isAuthenticated: false }
      })

      Object.assign(req.auth.credentials, credentials)
      Object.assign(req.auth.artifacts, artifacts)
      req.auth.isAuthenticated = isAuthenticated
    }
  }

  switch (authOptions.mode) {
    // In order to access the route,
    // the user must be not provide authorization,
    // otherwise they will receive an error.
    case 'forbidden':
      if (authorization) {
        return next(new HTTP(HTTP._CODE.NOT_ACCEPTABLE))
      }
      break

    // In order to access the route,
    // the user must be authenticated,
    // and their authentication must be valid,
    // otherwise they will receive an error.
    case 'required':
      if (!req.auth.isAuthenticated) {
        return next(new HTTP(HTTP._CODE.UNAUTHORIZED))
      }
      break

    // In this case the user does not need to be authenticated.
    // Authentication data is optional,
    // but must be valid if provided.
    case 'optional':
      if (authorization && !req.auth.isAuthenticated) {
        return next(new HTTP(HTTP._CODE.UNAUTHORIZED))
      }
      break

    // Like optional,
    // But invalid authentication is accepted,
    // and the user will still reach the route handler.
    case 'try':
      break
  }

  return next()
}
