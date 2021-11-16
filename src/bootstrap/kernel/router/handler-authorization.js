import { HTTP } from '../http'

function parseAuthorizationStr (str) {
  return str
    .replace(/\s+/gm, '')
    .split('|')
    .map(
      group => {
        const [role, permissionStr] = group.split(':')
        return {
          role,
          permissions: permissionStr?.split(',')
        }
      }
    )
}

/**
 * By deep nested of array level from 1
 * odd is $or
 * even is $and
 * @param {string|[string]|[[string]]|{
 *     role: string;
 *     permissions: string[]
 *   }|[{
 *     role: string;
 *     permissions: string[]
 *   }]|[[{
 *     role: string;
 *     permissions: string[]
 *   }]]} options
 * @returns {[[{
 *   role: string;
 *   permissions: string[]
 * }]]}
 */
function parseAuthorizationOptions (options) {
  if (!options) {
    return []
  }

  const _options = Array.isArray(options)
    ? options
    : [options]

  for (const index in _options) {
    const _option = _options[index]

    if (typeof _option === 'string') {
      _options[index] = parseAuthorizationStr(_option)
      continue
    }

    if (Array.isArray(_option)) {
      _options[index] = _option.map(
        e => typeof e === 'string'
          ? parseAuthorizationStr(e)
          : e
      )
      continue
    }

    _options[index] = [_option]
  }

  return _options
}

/**
 * Check is grant
 * @param {{ role: string; permissions: string[] }}
 * @param {{
 *   roles: string[]
 *   permissions: string[]
 * }}
 * @returns {boolean}
 */
const checkPermission = (
  {
    role: requiredRole,
    permissions: requiredPermissions = []
  } = {},
  {
    roles = [],
    permissions: userPermissions = []
  } = {}
) => {
  // userRoles must includes required role
  const isGrantRole = !requiredRole || roles.includes(requiredRole)

  // userPermissions must includes all requiredPermissions
  const isGrantPermissions = !requiredPermissions.length || !requiredPermissions.some(
    requiredPermission => !userPermissions.includes(requiredPermission)
  )

  return isGrantRole && isGrantPermissions
}

/**
 * Must pass one in all groups
 * @param {[{
 *   role: string
 *   permissions: string[]
 * }]|{
 *   role: string
 *   permissions: string[]
 * }} groups
 * @param {{
 *   roles: string[]
 *   permissions: string[]
 * }}
 * @returns {boolean}
 */
const $orCheck = (groups, { roles = [], permissions = [] } = {}) => {
  // must pass one in all groups
  for (const group of groups) {
    const isGrantPermission = Array.isArray(group)
      ? $andCheck(group, { roles, permissions })
      : checkPermission(group, { roles, permissions })
    if (isGrantPermission) {
      return true
    }
  }

  return false
}

/**
 * Must pass all groups
 * @param {[{
 *   role: string
 *   permissions: string[]
 * }]|{
 *   role: string
 *   permissions: string[]
 * }} groups
 * @param {{
 *   roles: string[]
 *   permissions: string[]
 * }}
 * @returns {boolean}
 */
const $andCheck = (groups, { roles = [], permissions = [] } = {}) => {
  for (const group of groups) {
    const isGrantPermission = Array.isArray(group)
      ? $orCheck(group, { roles, permissions })
      : checkPermission(group, { roles, permissions })
    if (!isGrantPermission) {
      return false
    }
  }

  return true
}

/**
 * @param {[[{
 *   role: string;
 *   permissions: string[]
 * }]]}
 * @param {{
 *   roles: string[]
 *   permissions: string[]
 * }}
 * @returns {boolean}
 */
const authorization = (groups, { roles = [], permissions = [] }) => {
  if (!groups.length) {
    return true
  }

  /**
   * first level of nested groups is $or
   */
  const isGrant = $orCheck(groups, { roles, permissions })

  return isGrant
}

/**
 * Router authorization middleware
 * @param {{
 *   mode: string;
 *   allow: string|[string]|[[string]]|{
 *     role: string;
 *     permissions: string[]
 *   }|[{
 *     role: string;
 *     permissions: string[]
 *   }]|[[{
 *     role: string;
 *     permissions: string[]
 *   }]];
 *   [key in string]: any;
 * }} authOptions
 */
export const handlerAuthorization = authOptions => {
  const rolesPermissions = parseAuthorizationOptions(authOptions.allow)

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  return async (req, res, next) => {
    if (!rolesPermissions.length || authorization(rolesPermissions, req.auth.credentials)) {
      return next()
    }

    const isAuthenticated = req.auth?.isAuthenticated
    if (!isAuthenticated) {
      return res.status(HTTP._CODE.UNAUTHORIZED).end()
    }

    const isAllow = await authorization(rolesPermissions, req.auth)
    if (!isAllow) {
      return res.status(HTTP._CODE.FORBIDDEN).end()
    }

    return next()
  }
}
