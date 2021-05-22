/**
 * A paginate static method for mongoose model
 * @param {Object} [conditions] - defaults to {}
 * @param {Object} [options] - defaults to {}
 * @param {Function} [callback] - defaults to {}
 * @returns {Promise<Pagination>} a pagination of mongoose model
 */
function paginate (conditions = {}, options = {}, callback) {
  /* Normalize data */
  if (typeof options === 'function') {
    callback = options
    options = {}
  } else if (typeof conditions === 'function') {
    callback = conditions
    options = {}
    conditions = {}
  }

  const { sort, lean = false, page = 1, limit = 10, offset = 0, select, populate } = options
  const skip = (page - 1) * limit + offset

  /* Paginate a mongoose model */
  return Promise.all([
    this.find(conditions)
      .populate(populate)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(lean),

    this.countDocuments(conditions)
  ])
    .then(([docs = [], total = 0]) => {
      const pages = Math.ceil(total / limit) || 1
      const pagination = { docs, page, limit, total, offset, pages }

      if (typeof callback === 'function') {
        return callback(null, pagination)
      }

      return Promise.resolve(pagination)
    })
    .catch(error => {
      if (typeof callback === 'function') {
        return callback(error)
      }

      return Promise.reject(error)
    })
}

/**
 * Mongoose paginate plugin (BETA)
 * @param {Schema} schema
 * @References: https://github.com/edwardhotchkiss/mongoose-paginate
 */
export function paginatePlugin (schema) {
  schema.statics.paginate = paginate
}
