/**
* File name: errors.js
* Created by Visual studio code
* User: Danh Le / danh.danh20051995@gmail.com
* Date: 2019-01-18 17:37:58
*/
module.exports = (req, res, next) => {
  res.locals.errors = req.flash('errors')
  next()
}
