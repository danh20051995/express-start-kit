# express-start-kit

> A express project template

## Prerequisites

To run this app locally you will need a few things:

- Install [NodeJS and NPM](https://nodejs.org/en/)
<!-- - Install [MongoDB](https://docs.mongodb.com/manual/installation/) -->
<!-- - Install [Redis](https://redis.io/) -->

## Environment variables [(dotenv)](https://www.npmjs.com/package/dotenv)

Copy [.env.example](https://github.com/danh20051995/express-start-kit/blob/master/.env.example) to `.env`

``` bash
cp .env.example .env
```

## Setup

``` bash
# install dependencies
npm install

# serve with hot reload and linter
npm run start

# run linter
npm run eslint

```

## Installed

|     Plugin          |     Document  |
|     ------------    |     -----------         |
| Package manager | [npm](https://www.npmjs.com/) |
| Hook installer for git | [husky](https://github.com/typicode/husky) |
| Run linter staged git files | [lint-staged](https://github.com/okonet/lint-staged) |
| Javascript transpiler | [babel](https://babeljs.io/) |
| Linter tool | [eslint](https://eslint.org/) |
| Managing environment variables | [dotenv](https://github.com/motdotla/dotenv) |
| App configurations | [config](https://www.npmjs.com/package/config) |
| Promise based HTTP client | [axios](https://github.com/axios/axios) |
| Value parsing and validation | [joi](https://www.npmjs.com/package/joi) |
| ORM | [sequelize](https://www.npmjs.com/package/sequelize) |
| Documentation | [swagger](https://swagger.io) |

## Work space structure

``` bash
├── Dockerfile
├── README.md
├── docker-compose.yml
├── logo.png
├── nodemon.json
├── package-lock.json
├── package.json
├── ecosystem.config.js
├── _register.js
├── index.js
├── jsconfig.json
├── src
|  ├── index.js
|  ├── bootstrap
|  |  ├── index.js
|  |  └── kernel
|  ├── config # wrapper around dotenv process.env
|  |  ├── default.js
|  |  └── index.js
|  ├── constants # table names, common used regex-patterns, documentation spec, ...etc
|  |  ├── documentation.js
|  |  ├── regex.js
|  |  ├── seeder.js
|  |  └── table-name.js
|  ├── database # table models, migrations, seeders
|  ├── polyfill
|  |  ├── index.js
|  |  ├── promise.allSettled.js
|  |  ├── promise.settled.js
|  |  └── promise.timeout.js
|  ├── routes
|  |  ├── admin # admin api
|  |  ├── api # user api
|  |  ├── index.js
|  |  ├── middleware.js
|  |  ├── parameters.js
|  |  └── validate.js
|  ├── services
|  |  ├── authenticate.js
|  |  └── email.js
|  └── utils
|     ├── array.js
|     ├── date.js
|     ├── file.js
|     ├── helpers.js
|     ├── joi-helpers.js
|     └── pipeline.js
└── temp
```

## Must reads

- [bootstrap](https://github.com/danh20051995/express-start-kit/blob/master/src/bootstrap/README.md)
- [routes](https://github.com/danh20051995/express-start-kit/blob/master/src/routes/README.md)
- [models](https://github.com/danh20051995/express-start-kit/blob/master/src/database/README.md)

## Recommended reads

### ES6

- [http://es6-features.org](http://es6-features.org)

### Sequelize

- [https://sequelize.org/master/index.html](https://sequelize.org/master/index.html)
- [https://sequelize.org/master/manual/model-basics.html](https://sequelize.org/master/manual/model-basics.html)
- [https://sequelize.org/master/manual/assocs.html](https://sequelize.org/master/manual/assocs.html)
