import { JsonWebTokenError } from 'jsonwebtoken'
import { AuthenticateService } from '@/services/authenticate'
import { HTTP } from '../http'

/**
 * Router authentication middleware
 * @param {{
 *   mode: string;
 *   allow: string|string[];
 *   [key in string]: any;
 * }} authOptions
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

  const authorization = req.headers?.authorization || req.sessionCookies?.get('authorization')
  if (authorization) {
    const [tokenType, jwtToken] = authorization.split(/\s+/)
    if (jwtToken && tokenType === AuthenticateService.tokenType) {
      const { isAuthenticated, credentials, artifacts } = await AuthenticateService.auth(jwtToken).catch(error => {
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
        return res.status(HTTP._CODE.NOT_ACCEPTABLE).end()
      }
      break

    // In order to access the route,
    // the user must be authenticated,
    // and their authentication must be valid,
    // otherwise they will receive an error.
    case 'required':
      if (!req.auth.isAuthenticated) {
        return res.status(HTTP._CODE.UNAUTHORIZED).end()
      }
      break

    // In this case the user does not need to be authenticated.
    // Authentication data is optional,
    // but must be valid if provided.
    case 'optional':
      if (authorization && !req.auth.isAuthenticated) {
        return res.status(HTTP._CODE.UNAUTHORIZED).end()
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
