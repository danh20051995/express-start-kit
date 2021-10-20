# bootstrap

> This directory contains the kernel of the whole app, which basically are middleware, router scanner, document generator, http code, check directory tree below for more detail

## Structure Overview

```bash
├── README.md
├── index.js # bootstrap function, which creates and starts the Express app
└── kernel
   ├── http.js # defines common used HTTP status codes and HTTP Error, which extends Error. Route handlers aka controllers should throw HTTP Error instead of Error
   ├── middleware
   |  ├── error-handling.js # 404 error handler and error handler
   |  ├── inject-url-info.js # add a `URL` property into request.
   |  ├── multipart-handling.js # handler multipart/form-data
   |  ├── response-time.js
   |  └── timeout-handling.js
   └── router
      ├── handler-authentication.js
      ├── handler-authorization.js
      ├── handler-event-layer.js
      ├── handler-exception.js
      ├── handler-validation.js
      ├── index.js
      ├── loader.js # RouterLoader, which receives routers then builds the Express.Router hierarchy for whole app
      ├── scanner
      |  ├── index.js
      |  ├── scanner.js # RouterScanner, used in src/routes/index.js to scan routes and build routers for RouterLoader
      |  └── valid-routes.js # route validation schema, make sure all routes are defined in the same shape
      └── swagger
         ├── buildResponse.js # helper to build swagger response for each route
         ├── converter.js # generate swagger spec from routes
         ├── index.js
         ├── joi-to-swagger.js # convert Joi validation schema to swagger spec
         ├── model-to-swagger.js # convert sequelize model to swagger schema
         └── swagger-ui-express.js # style for swagger ui
```

## Route

All routes in this app are defined in the same shape, which basically is an object with properties such as: `method`, `path`, `validation`, `pre`, `preValidation`...etc. You can refer this as a router interface, but  there is no concept such as interface in Javascript, so we use a validation schema to make sure all routes are in a valid form. Check out [`routeSchema`](https://github.com/danh20051995/express-start-kit/blob/master/src/bootstrap/kernel/router/scanner/valid-routes.js) for more detail.

Value of properties: `preAuth`, `auth`, `postAuth`, `preValidation`, `validation`, `postValidation` will be passed to corresponding middleware, which are defined in `src/bootstrap/kernel/router` and executed before `handler` method executed. Check out [`loader.js`](https://github.com/danh20051995/express-start-kit/blob/master/src/bootstrap/kernel/router/loader.js) for more detail.

## Swagger

Thanks to the route interface, we can generate a corresponding swagger documentation for each route, but because of missing refelection in Javascript, some swagger spec such as response still need be documented manually by adding a `swagger.js` for each route.

### converter.js

This is the main logic of generating documentation from routes. It relies on methods in `joi-to-swagger.js` and `model-to-swagger.js` to convert validation schemas and models to swagger spec.
