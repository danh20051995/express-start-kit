import { Config } from '@/config'
const ExternalSwaggerJson = require('./external-swagger.json')

const addPrefix = str => `[external] | ${str}`

const ExternalSwagger = {
  ...ExternalSwaggerJson,
  servers: ExternalSwaggerJson.servers.map(e => {
    if (e.description) {
      e.description = addPrefix(e.description)
    }
    return e
  }),
  tags: ExternalSwaggerJson.tags.map(
    ({ name }) => ({ name: addPrefix(name) })
  ),
  paths: Object.keys(ExternalSwaggerJson.paths).reduce(
    (_paths, _url) => ({
      ..._paths,
      [_url]: {
        ...Object.keys(ExternalSwaggerJson.paths[_url]).reduce(
          (_routes, _method) => {
            if (!ExternalSwaggerJson.paths[_url][_method].tags) {
              ExternalSwaggerJson.paths[_url][_method].tags = ['default']
            }
            return ({
              ..._routes,
              [_method]: {
                ...ExternalSwaggerJson.paths[_url][_method],
                tags: ExternalSwaggerJson.paths[_url][_method].tags.map(addPrefix)
              }
            })
          },
          {}
        )
      }
    }),
    {}
  )
}

export const Documentation = {
  ...ExternalSwagger,
  openapi: '3.0.3',
  info: {
    version: '1.0.0',
    title: `${Config.get('name')} | Documentation`,
    contact: { email: 'danh.danh20051995@gmail.com' },
    license: {
      name: 'Apache 2.0',
      url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
    }
  },
  servers: [
    {
      url: Config.get('connection.domain'),
      description: '[node] | Development'
    },
    {
      url: 'http://staging.example.com/backend',
      description: '[node] | Staging'
    },
    {
      url: 'http://prod.example.com/backend',
      description: '[node] | Production'
    },
    ...ExternalSwagger.servers
  ],
  components: {
    ...ExternalSwagger.components,
    securitySchemes: {
      ...ExternalSwagger.components.securitySchemes,
      JWT: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        value: 'Bearer <JWT>',
        description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
      }
    }
  },
  paths: { ...ExternalSwagger.paths }
}
