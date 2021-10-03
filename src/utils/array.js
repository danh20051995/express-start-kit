/**
 * Unique array object by item's field
 * @param {object[]} items
 * @param {(item: object) => any} getVal get compare value of an item
 * @returns {object[]} removed last duplicate items
 */
export function uniqKeepFirst (items, getVal) {
  const seen = new Set()
  return items.filter(item => {
    const val = getVal(item)
    return seen.has(val) ? false : seen.add(val)
  })
}

/**
 * Unique array object by item's field
 * @param {object[]} items
 * @param {(item: object) => any} getVal get compare value of an item
 * @returns {object[]} removed first duplicate items
 */
export function uniqKeepLast (items, getVal) {
  return [
    ...new Map(
      items.map(x => [getVal(x), x])
    ).values()
  ]
}
