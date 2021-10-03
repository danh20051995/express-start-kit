import set from 'lodash/set'
import get from 'lodash/get'
import find from 'lodash/find'
import merge from 'lodash/merge'
import isEqual from 'lodash/isEqual'
import uniqWith from 'lodash/uniqWith'
import isNumber from 'lodash/isNumber'
import isString from 'lodash/isString'
import isPlainObject from 'lodash/isPlainObject'
import Joi from 'joi'

const patterns = {
  alphanum: '^[a-zA-Z0-9]*$',
  token: '^[a-zA-Z0-9_]*$'
}

const meta = (schema, key) => {
  const flattened = Object.assign.apply(null, [{}].concat(schema.$_terms.metas))
  return get(flattened, key)
}

const refDef = (type, name) => ({ $ref: '#/components/' + type + '/' + name })

const getMinMax = (schema, suffix = 'Length') => {
  const swagger = {}

  for (let i = 0; i < schema._rules.length; i++) {
    const test = schema._rules[i]
    if (test.name === 'min') {
      swagger[`min${suffix}`] = test.args.limit
    }

    if (test.name === 'max') {
      swagger[`max${suffix}`] = test.args.limit
    }

    if (test.name === 'length') {
      swagger[`min${suffix}`] = test.args.limit
      swagger[`max${suffix}`] = test.args.limit
    }
  }

  return swagger
}

const getCaseSuffix = schema => {
  const caseRule = find(schema._rules, { name: 'case' })

  if (caseRule && caseRule.args.direction === 'lower') {
    return 'Lower'
  } else if (caseRule && caseRule.args.direction === 'upper') {
    return 'Upper'
  }

  return ''
}

const schemaForAlternatives = (alternatives, existingComponents, newComponentsByRef, mode) => {
  let swaggers = []

  for (const joiSchema of alternatives) {
    const swaggerConfig = joiToSwagger(
      joiSchema,
      merge(
        {},
        existingComponents || {},
        newComponentsByRef || {}
      )
    )
    if (!swaggerConfig || !swaggerConfig.swagger) {
      continue // swagger is falsy if joi.forbidden()
    }

    const { swagger, components } = swaggerConfig

    if (get(joiSchema, '_flags.presence') === 'required') {
      swagger['x-required'] = true
    }
    merge(newComponentsByRef, components || {})

    swaggers.push(swagger)
  }

  swaggers = uniqWith(swaggers, isEqual)
  return swaggers.length > 0 ? { [mode]: swaggers } : {}
}

const parseWhens = (schema, existingComponents, newComponentsByRef) => {
  const whens = get(schema, '$_terms.whens')
  const mode = whens.length > 1 ? 'anyOf' : 'oneOf'

  const alternatives = []
  for (const w of whens) {
    if (w.then) alternatives.push(w.then)
    if (w.otherwise) alternatives.push(w.otherwise)
    if (w.switch) {
      for (const s of w.switch) {
        if (s.then) alternatives.push(s.then)
        if (s.otherwise) alternatives.push(s.otherwise)
      }
    }
  }

  return schemaForAlternatives(alternatives, existingComponents, newComponentsByRef, mode)
}

function parseValidsAndInvalids (schema, filterFunc) {
  const swagger = {}

  if (schema._valids) {
    const valids = schema._valids.values().filter(filterFunc)
    if (get(schema, '_flags.only') && valids.length) {
      swagger.enum = valids
    }
  }

  if (schema._invalids) {
    const invalids = schema._invalids.values().filter(filterFunc)
    if (invalids.length) {
      swagger.not = { enum: invalids }
    }
  }

  return swagger
}

const parseAsType = {
  number: schema => {
    const swagger = {}

    if (find(schema._rules, { name: 'integer' })) {
      swagger.type = 'integer'
    } else {
      swagger.type = 'number'
      if (find(schema._rules, { name: 'precision' })) {
        swagger.format = 'double'
      } else {
        swagger.format = 'float'
      }
    }

    const sign = find(schema._rules, { name: 'sign' })
    if (sign) {
      if (sign.args.sign === 'positive') {
        swagger.minimum = 1
      } else if (sign.args.sign === 'negative') {
        swagger.maximum = -1
      }
    }

    const min = find(schema._rules, { name: 'min' })
    if (min) {
      swagger.minimum = min.args.limit
    }

    const max = find(schema._rules, { name: 'max' })
    if (max) {
      swagger.maximum = max.args.limit
    }

    Object.assign(swagger, parseValidsAndInvalids(schema, (s) => isNumber(s)))
    return swagger
  },
  string: schema => {
    const swagger = { type: 'string' }

    if (find(schema._rules, { name: 'alphanum' })) {
      const strict = get(schema, '_preferences.convert') === false
      swagger.pattern = patterns[`alphanum${strict ? getCaseSuffix(schema) : ''}`]
    }

    if (find(schema._rules, { name: 'token' })) {
      swagger.pattern = patterns.token
    }

    if (find(schema._rules, { name: 'email' })) {
      swagger.format = 'email'
      if (swagger.pattern) delete swagger.pattern
    }

    if (find(schema._rules, { name: 'isoDate' })) {
      swagger.format = 'date-time'
      if (swagger.pattern) delete swagger.pattern
    }

    if (find(schema._rules, { name: 'guid' })) {
      swagger.format = 'uuid'
      if (swagger.pattern) delete swagger.pattern
    }

    const pattern = find(schema._rules, { name: 'pattern' })
    if (pattern) {
      swagger.pattern = pattern.args.regex.toString().slice(1, -1)
    }

    Object.assign(swagger, getMinMax(schema))
    Object.assign(swagger, parseValidsAndInvalids(schema, (s) => isString(s)))

    return swagger
  },
  binary: schema => {
    const swagger = { type: 'string', format: 'binary' }

    if (get(schema, '_flags.encoding') === 'base64') {
      swagger.format = 'byte'
    }

    Object.assign(swagger, getMinMax(schema))

    return swagger
  },
  date: (/* schema */) => ({ type: 'string', format: 'date-time' }),
  boolean: (/* schema */) => ({ type: 'boolean' }),
  alternatives: (schema, existingComponents, newComponentsByRef) => {
    const matches = get(schema, '$_terms.matches')
    const mode = `${get(schema, '_flags.match') || 'any'}Of`

    const alternatives = []
    for (const m of matches) {
      if (m.ref) {
        if (m.then) alternatives.push(m.then)
        if (m.otherwise) alternatives.push(m.otherwise)
        if (m.switch) {
          for (const s of m.switch) {
            if (s.then) alternatives.push(s.then)
            if (s.otherwise) alternatives.push(s.otherwise)
          }
        }
      } else {
        alternatives.push(m.schema)
      }
    }

    return schemaForAlternatives(alternatives, existingComponents, newComponentsByRef, mode)
  },
  array: (schema, existingComponents, newComponentsByRef) => {
    const items = get(schema, '$_terms.items')
    const mode = 'oneOf'

    const alternatives = items

    let swaggers = []
    for (const joiSchema of alternatives) {
      const swaggerConfig = joiToSwagger(
        joiSchema,
        merge(
          {},
          existingComponents || {},
          newComponentsByRef || {}
        )
      )
      if (!swaggerConfig || !swaggerConfig.swagger) {
        continue // swagger is falsy if joi.forbidden()
      }

      const { swagger, components } = swaggerConfig
      merge(newComponentsByRef, components || {})

      swaggers.push(swagger)
    }
    swaggers = uniqWith(swaggers, isEqual)

    const openapi = {
      type: 'array',
      items: { [mode]: swaggers }
    }
    if (swaggers.length <= 1) {
      openapi.items = get(swaggers, [0]) || {}
    }

    Object.assign(openapi, getMinMax(schema, 'Items'))

    if (find(schema._rules, { name: 'unique' })) {
      openapi.uniqueItems = true
    }

    return openapi
  },
  object: (schema, existingComponents, newComponentsByRef) => {
    const requireds = []
    const properties = {}

    const combinedComponents = merge({}, existingComponents || {}, newComponentsByRef || {})

    const children = get(schema, '$_terms.keys') || []
    children.forEach((child) => {
      const key = child.key
      const swaggerConfig = joiToSwagger(child.schema, combinedComponents)
      if (!swaggerConfig || !swaggerConfig.swagger) { // swagger is falsy if joi.forbidden()
        return
      }

      const { swagger, components } = swaggerConfig
      merge(newComponentsByRef, components || {})
      merge(combinedComponents, components || {})

      properties[key] = swagger

      if (get(child, 'schema._flags.presence') === 'required') {
        requireds.push(key)
      }
    })

    const swagger = {
      type: 'object',
      properties
    }
    if (requireds.length) {
      swagger.required = requireds
    }

    if (get(schema, '_flags.unknown') !== true) {
      swagger.additionalProperties = false
    }

    return swagger
  },
  any: (schema) => {
    const swagger = {}
    // convert property to file upload, if indicated by meta property
    Object.assign(swagger, parseValidsAndInvalids(schema, (s) => isString(s) || isNumber(s)))
    return swagger
  }
}

const joiToSwagger = (schema, existingComponents = {}) => {
  if (!schema) {
    throw new Error('No schema was passed')
  }

  if (isPlainObject(schema)) {
    schema = Joi.object().keys(schema)
  }

  if (!Joi.isSchema(schema)) {
    throw new TypeError('Passed schema does not appear to be a joi schema')
  }

  const flattenMeta = Object.assign.apply(null, [{}].concat(schema.$_terms.metas))

  const override = flattenMeta.swagger
  if (override && flattenMeta.swaggerOverride) {
    return { swagger: override, components: {} }
  }

  const metaDefName = flattenMeta.className
  const metaDefType = flattenMeta.classTarget || 'schemas'

  // if the schema has a definition class name, and that
  // definition is already defined, just use that definition
  if (metaDefName && get(existingComponents, [metaDefType, metaDefName])) {
    return { swagger: refDef(metaDefType, metaDefName) }
  }

  if (get(schema, '_flags.presence') === 'forbidden') {
    return false
  }

  const type = meta(schema, 'baseType') || schema.type

  if (!parseAsType[type]) {
    throw new TypeError(`${type} is not a recognized Joi type`)
  }

  const components = {}
  const swagger = parseAsType[type](schema, existingComponents, components)
  if (get(schema, '$_terms.whens')) {
    Object.assign(swagger, parseWhens(schema, existingComponents, components))
  }

  if (!swagger) {
    return { swagger, components }
  }

  if (schema._valids && schema._valids.has(null)) {
    swagger.nullable = true
  }

  const description = get(schema, '_flags.description')
  if (description) {
    swagger.description = description
  }

  if (schema.$_terms.examples) {
    if (schema.$_terms.examples.length === 1) {
      swagger.example = schema.$_terms.examples[0]
    } else {
      swagger.examples = schema.$_terms.examples
    }
  }

  const label = get(schema, '_flags.label')
  if (label) {
    swagger.title = label
  }

  const defaultValue = get(schema, '_flags.default')
  if (defaultValue && typeof defaultValue !== 'function') {
    swagger.default = defaultValue
  }

  if (metaDefName) {
    set(components, [metaDefType, metaDefName], swagger)
    return { swagger: refDef(metaDefType, metaDefName), components }
  }

  if (override) {
    Object.assign(swagger, override)
  }

  return { swagger, components }
}

export default joiToSwagger
