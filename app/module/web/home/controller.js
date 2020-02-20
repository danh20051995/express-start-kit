/**
* File name: controller.js
* Created by Visual studio code
* User: Danh Le / danh.danh20051995@gmail.com
* Date: 2019-01-18 17:39:07
*/
const home = (req, res) => {
  // console.log(req.auth)

  // Cookies that have not been signed
  // console.log('Cookies: ', req.cookies)

  // Cookies that have been signed
  // console.log('Signed Cookies: ', req.signedCookies)

  res.render('pages/welcome')
}

export default {
  home
}
