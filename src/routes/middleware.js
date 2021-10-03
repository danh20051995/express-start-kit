import { HTTP } from '@/bootstrap/kernel/http'
import { validSequelizeModel } from '@/bootstrap/kernel/router/swagger/buildResponse'

/**
 * Find one exists or response 404 error
 * @param {Model} Model
 * @param {object} options to override query options
 * @returns {Promise<never|object>}
 */
export const findOrFail = (Model, { field = 'id', ...options } = {}) => {
  validSequelizeModel(Model)

  return async (req, res) => {
    const value = req.params[field]
    const administrator = await Model.findOne({
      where: { [field]: value },
      attributes: { exclude: ['password'] },
      ...options
    })

    if (!administrator) {
      throw new HTTP(
        HTTP._CODE.NOT_FOUND,
        `${Model.name} not found`
      )
    }

    return administrator
  }
}

/**
 * If one exists response 409 error
 * @param {Model} Model
 * @param {{
 *   field: string
 *   message: string
 *   getConditionValue: (req, res) => string|number|boolean
 * }} options
 * @returns {Promise<never|void>}
 */
export const mustNotExists = (Model, { field = 'email', message = '', getConditionValue = req => req.body.email }) => {
  validSequelizeModel(Model)

  return async (req, res) => {
    const exists = await Model.findOne({
      paranoid: !Model.options.paranoid,
      where: { [field]: getConditionValue(req, res) },
      attributes: [field]
    })

    if (exists) {
      throw new HTTP(
        HTTP._CODE.CONFLICT,
        message || `${field} has already been taken`
      )
    }
  }
}

/**
 * If conflict value response 409 error
 * @param {Model} Model
 * @param {{
 *   assignKey: string
 *   field: string
 *   message: string
 *   getField: (req, res) => string|number|boolean
 * }} options
 * @returns {Promise<never|void>}
 */
export const deniedConflictPreValue = ({
  assignKey = '',
  field = 'status',
  message = '',
  getField
} = {}) => {
  return (req, res) => {
    const _field = typeof getField === 'function'
      ? getField(req, res)
      : field

    if (req.pre[assignKey][_field] === req.body[_field]) {
      throw new HTTP(
        HTTP._CODE.CONFLICT,
        message || `New ${_field} cannot be the same as current ${_field}`
      )
    }
  }
}
