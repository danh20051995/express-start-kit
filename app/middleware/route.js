/**
* File name: route.js
* Created by Visual studio code
* User: Danh Le / danh.danh20051995@gmail.com
* Date: 2019-01-18 17:38:02
*/
module.exports = (req, res, next) => {
  res.locals.route = {
    url: req.url,
    path: req.path
  }
  next()
}
