/**
 * File name: error.js
 * Created by Visual studio code
 * User: Danh Le / danh.danh20051995@gmail.com
 * Date: 2019-01-18 17:38:51
 */
import ev from 'express-validation'
import { getFirstValidateError } from '_utils/helpers'

module.exports = app => {
  app.get('/403', (req, res) => {
    res.render('errors/403', {
      error: req.flash('error')
    })
  })

  app.get('/404', (req, res) => {
    res.render('errors/404', {
      error: req.flash('error')
    })
  })

  app.get('/500', (req, res) => {
    res.render('errors/500', {
      error: req.flash('error')
    })
  })

  // Handle 404
  app.use((req, res) => {
    res.status(404)

    if (req.path.match(/^\/api\//)) {
      return res.boom.notFound()
    }

    // res.redirect('/404')
    res.render('errors/404', {
      error: req.flash('error')
    })
  })

  // Handle error
  app.use((error, req, res, next) => {
    console.log(error)

    if (req.path.match(/^\/api\//)) {
      if (error instanceof ev.ValidationError) {
        return res.boom.badRequest(getFirstValidateError(error))
      }

      return res.boom.badImplementation(error)
    }

    if (error instanceof ev.ValidationError) {
      req.flash('errors', getFirstValidateError(error))
      return res.status(400).redirect('back')
    }

    req.flash('errors', error)
    res
      .status(500)
      // .redirect('/500')
      .render('errors/500', {
        error: req.flash('error')
      })
  })
}
