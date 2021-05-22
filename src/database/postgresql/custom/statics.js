/**
 * @returns {Promise} pagination
 */
function paginate ({ page = 1, limit = 10, offset = 0, ...args } = {}) {
  return this.findAndCountAll({
    ...args,
    limit,
    offset: (page - 1) * limit + offset
  })
}

export function injectStatics (Model) {
  Model.paginate = paginate.bind(Model)
  return Model
}
