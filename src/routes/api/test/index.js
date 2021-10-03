import RoutePreTest from './route-pre'
import RouteAuthorizationTest from './route-authorization'

export default process.isDev
  ? [
    ...RoutePreTest,
    ...RouteAuthorizationTest
  ]
  : []
