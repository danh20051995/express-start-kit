# express-start-kit

## Pre-REQS

To build and run this app locally you will need a few things:

- Install [NodeJS](https://nodejs.org/en/)
- Install [MongoDB](https://docs.mongodb.com/manual/installation/)
- Install [Redis](https://redis.io/)

## Install package

``` bash
npm i
```

## Start dev server

``` bash
npm run start
```

## DevDependencies

| Package       | Description |
| ------------  | ----------- |
| [cross-env](https://www.npmjs.com/package/cross-env)        | use environment variables across platforms |
| [nodemon](https://www.npmjs.com/package/nodemon)            | automatically restarting |
| [npm-run-all](https://www.npmjs.com/package/npm-run-all)    | A CLI tool to run multiple npm-scripts |
| [pre-commit](https://www.npmjs.com/package/pre-commit)      | git hook → exec eslint |
| [eslint](https://www.npmjs.com/package/eslint)              | a tool for identifying and reporting |
| [core-js](https://www.npmjs.com/package/core-js)            | Modular standard library for JavaScript |
| [babel](https://www.npmjs.com/package/@babel/register)      | a JavaScript compiler |
| [module-alias](https://www.npmjs.com/package/module-alias)  | Create aliases of directories and register custom module paths |
| [nunjucks](https://www.npmjs.com/package/nunjucks)          | template engine for javascript |
| [express](https://www.npmjs.com/package/express)            | a NodeJS framework |
| [config](https://www.npmjs.com/package/config)              | a Node organizes hierarchical configurations |
| [mongoose](https://www.npmjs.com/package/mongoose)          | a MongoDB object modeling tool |
| [ioredis](https://github.com/luin/ioredis)                  | a Redis client for Node.js |

## Work space

``` bash
├── ...         # source config, environment config, ...
├── index.js    # main
└── app
    ├── bootstrap    # auto load middleware, mongoose model, view-engine, ...
    ├── config       # app configurations
    ├── lib          # app libraries: mongo, redis, ...
    ├── model        # mongoose model
    ├── utils        # utilities function
    ├── module       # app modules
    │   │
    │   ├── error.js  # error handler
    │   │
    │   ├── api # RESTful modules
    │   │   ├── auth     # authentication module
    │   │   ├── book     # sample CRUD api
    │   │   ├── core     # sample file upload
    │   │   ├── <module> # sample module skeleton
    │   │   │   ├── index.js        # route register
    │   │   │   ├── validate.js     # route validator
    │   │   │   ├── controller.js   # route handler
    │   │   │   └── ...
    │   │   └── ...
    │   ├── web # web SSR modules
    │   │   ├── auth     # authentication module
    │   │   ├── home     # currently display home page only
    │   │   ├── <module> # sample module skeleton
    │   │   │   ├── index.js        # route register
    │   │   │   ├── validate.js     # route validator
    │   │   │   ├── controller.js   # route handler
    │   │   │   └── ...
    │   │   └── ...
    │   └── ...
    ├── views
    │   ├── errors  # error page name by status code
    │   ├── layouts # template layout
    │   ├── pages   # template files
    │   └── partial # template partial
    └── ...
```
