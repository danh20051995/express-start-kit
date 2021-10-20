import { Op } from 'sequelize'
import slugify from 'slugify'

/**
 * @returns {Promise} pagination
 */
async function paginate ({ page = 1, limit = 10, offset = 0, order = '', ...args } = {}) {
  const { count: total, rows } = await this.findAndCountAll({
    ...args,
    limit,
    offset: (page - 1) * limit + offset,
    order: order
      ? typeof order === 'string'
        ? [order.split('-')]
        : order
      : undefined
  })

  return {
    total,
    rows,
    page,
    pages: Math.ceil(total / limit)
  }
}

/**
 * Generate unique value like slug
 * @param {string} text
 * @param {number} num
 * @returns {Promise<string>} slugify string
 */
export async function generateUniq (text, num = 0) {
  const slugStr = String(num ? text + ' ' + num : text)
  const uniqVal = slugify(slugStr).toLowerCase()
  const count = await this.count({
    paranoid: !this.options.paranoid,
    where: {
      [this.uniqField]: {
        [Op.substring]: uniqVal
      }
    }
  })

  // debug performance
  if (process.env.isDev) {
    console.log(`Generate ${this.tableName} ${this.uniqField} count: ${this.uniqField} | `, count)
  }

  if (!count) {
    return uniqVal
  }

  return generateUniq.call(this, text, count + 1)

  /** all is the same */
  // return generateUniq.call(this, text, count + 1)
  // return generateUniq.apply(this, [text, count + 1])
  // return generateUniq.bind(this)(text, count + 1)
  // return generateUniq.bind(this, text, count + 1)()
}

export function injectStatics (Model) {
  Model.paginate = paginate.bind(Model)
  return Model
}
