# routes

> All app routes (aka api) are defined in this directory.

## Structure Overview

```bash
├── README.md
├── admin # api for admin, which requires role of `admin`
├── api # api for user, some may be public api, some may require role of `user`
├── index.js
├── middleware.js # middleware which are used widely by all routes
├── parameters.js # predefined route's param constants
└── validate.js # a base validation schema for route defined
```

## Dealing with new function

More often than not, we put related apis under the same directory, this directory conventionally contains 4 files: `index.js`, `controller.js`, `validate.js` and `response-example.js`

### index.js

Api routes are defined in this file, make sure the route follows the [`route interface`](https://github.com/danh20051995/express-start-kit/blob/master/src/bootstrap/README.md#route).

e.g:

```js
export default [
  {
    method: 'GET', //  POST, GET, PUT, PATCH, DELETE
    path: '/profile', // api endpoint
    tags: ['auth'], // metadata for swagger generation
    summary: 'Get authentication profile', // ditto
    auth: { // param for handler-authentication and handler-authorization middleware
      mode: 'required',
      allow: 'user'
    },
    swagger: { // swagger generation
      response: ResponseExample.profile
    },
    handler: Controller.profile // handler of this route
  },
  {
    method: 'GET',
    path: `/user/${PARAM_UUID_V4}`,
    tags: ['user'],
    summary: 'Get one user information',
    auth: {
      mode: 'required',
      allow: 'admin'
    },
    // optional. Executed before handler, the method execution result will be added to req[assign], so the handler can easily retrieve it later
    // In this example, we find the User by id value and assign the result to req.pre.user
    // This method will throw exception if there is no User found
    pre: [{
      method: findOrFail(UserModel),
      assign: 'user'
    }],
    swagger: {
      response: ResponseExample.show
    },
    validation: Validate.show, // optional. Make sure the request handed to handler is in the valid form
    handler: Controller.show
  }
]
```

## validate.js

Export validation schema for each route defined in `index.js`. We use [`Joi`](https://www.npmjs.com/package/joi) to create validation schema, check out [`Joi documentation`](https://joi.dev/api) for more detail.

e.g

```js
export const show = {
  params: Joi.object({
    _id: Joi.string().guid().required().description('user\'s _id')
  })
}
```

## controller.js

Export route handlers.

e.g

```js
export const update = async (req, res) => {
  const { user } = req.pre

  for (const field of Object.keys(req.body)) {
    if (!isUndefined(req.body[field])) {
      user.set(field, req.body[field])
    }
  }

  if (user.changed()) {
    await user.save()
  }

  return res.status(HTTP._CODE.NO_CONTENT).end()
}

export const show = async (req, res) => req.pre.user.toJSON()
```

## response-example.js

Define swagger api response for each route. This is optional, api response will be generate by reading the handler source code if there is no `swagger#response` property defined in the route.

e.g:

```js
export const paginateUsers = buildResponse({
  code: HTTP._CODE.OK,
  schema: paginationResponse(UserModel)
})
```
