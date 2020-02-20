/**
* File name: controller.js
* Created by Visual studio code
* User: Danh Le / danh.danh20051995@gmail.com
* Date: 2019-01-18 17:38:28
*/

const getTest = (req, res) => {
  res.send('Controller.getTest')
}

const postTest = (req, res) => {
  console.log(req.body)
  res.send(req.body)
}

export default {
  getTest,
  postTest
}
