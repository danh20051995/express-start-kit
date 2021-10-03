import Config from 'config'

export const Documentation = {
  openapi: '3.0.3',
  info: {
    version: '1.0.0',
    title: `${Config.get('package.name')} | Documentation`,
    contact: { email: Config.get('package.author') },
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
      url: 'https://staging.example.com',
      description: '[node] | Staging'
    },
    {
      url: 'http://prod.example.com',
      description: '[node] | Production'
    }
  ],
  components: {
    securitySchemes: {
      JWT: {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        value: 'Bearer <JWT>',
        description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
      }
    }
  },
  paths: {}
}
