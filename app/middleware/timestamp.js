/**
* File name: timestamp.js
* Created by Visual studio code
* User: Danh Le / danh.danh20051995@gmail.com
* Date: 2019-01-18 17:38:06
*/
module.exports = (req, res, next) => {
  req.timestamp = new Date().getTime()
  res.locals.timestamp = new Date().getTime()
  next()
}
