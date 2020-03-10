/**
 * File name: controller.js
 * Created by Visual studio code
 * User: Danh Le / danh.danh20051995@gmail.com
 * Date: 2019-01-18 17:38:39
 */
import path from 'path'
import mongoose from 'mongoose'
import File from '_utils/file'
import Image from '_utils/image'

const Book = mongoose.model('Book')
const config = global.CONFIG
const coverPath = config.get('upload.bookCover')

/**
 * Save book detail
 * @param {Object} req
 * @param {Object} res
 * @return {Response}
 */
const store = async (req, res) => {
  try {
    let { body } = req

    // resize cover
    let cover = path.join(coverPath, req.body.cover)
    let meta = await Image.getMeta(cover)
    if (meta.width < meta.height) {
      await Image.resizeReplace(cover, 300)
    } else {
      await Image.resizeReplace(cover, null, 300)
    }

    let book = await Book.create(body)

    // duplicate 300 books → test
    // for (let index = 0; index < 300; index++) {
    //   let numb = Number(index) + 1
    //   let copy = book.cover.split('.').shift() + '-' + numb + '.' + book.cover.split('.').pop()
    //   let copyPath = path.join(coverPath, copy)
    //   File.copy(cover, copyPath)
    //   await Book.create(Object.assign({}, body, { cover: copy }))
    // }

    return res.send(book)
  } catch (error) {
    return res.boom.badRequest(error)
  }
}

/**
 * Update book detail
 * @param {Object} req
 * @param {Object} res
 * @return {Response}
 */
const update = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
      return res.boom.notFound('Book not found.')
    }

    let book = await Book.findOne({ _id: req.params._id })
    if (!book) {
      return res.boom.notFound('Book not found.')
    }

    // remove old cover and resize new cover
    if (req.body.cover && req.body.cover !== book.cover) {
      if (book.cover) {
        let rmCover = path.join(coverPath, book.cover)
        File.delete(rmCover)
      }

      let cover = path.join(coverPath, req.body.cover)
      let meta = await Image.getMeta(cover)
      if (meta.width < meta.height) {
        await Image.resizeReplace(cover, 300)
      } else {
        await Image.resizeReplace(cover, null, 300)
      }
    }

    Object.assign(book, req.body)
    await book.save()

    return res.send(book)
  } catch (error) {
    return res.boom.badRequest(error)
  }
}

/**
 * Paginate book list
 * @param {Object} req
 * @param {Object} res
 * @return {Response}
 */
const getItems = async (req, res) => {
  try {
    let options = {
      // select: '',
      sort: { createdAt: -1 },
      lean: true,
      page: Number(req.query.page) || 1,
      limit: 10
      // populate: ''
    }
    let pagination = await Book.paginate({}, options)
    return res.send(pagination)
  } catch (error) {
    return res.boom.badRequest(error)
  }
}

/**
 * Get book detail
 * @param {Object} req
 * @param {Object} res
 * @return {Response}
 */
const getItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
      return res.boom.notFound('Book not found.')
    }

    let book = await Book.findOne({ _id: req.params._id })
    if (!book) {
      return res.boom.notFound('Book not found.')
    }

    return res.send(book)
  } catch (error) {
    return res.boom.badRequest(error)
  }
}

/**
 * Remove book detail
 * @param {Object} req
 * @param {Object} res
 * @return {Response}
 */
const remove = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
      return res.boom.notFound('Book not found.')
    }

    let book = await Book.findOne({ _id: req.params._id })
    if (!book) {
      return res.boom.notFound('Book not found.')
    }

    let rmCover = path.join(coverPath, book.cover)
    File.delete(rmCover)
    await book.remove()

    return res.send({ success: true })
  } catch (error) {
    return res.boom.badRequest(error)
  }
}

export default {
  store,
  update,
  getItems,
  getItem,
  remove
}
