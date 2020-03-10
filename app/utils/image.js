/**
 * File name: image.js
 * Created by Visual studio code
 * User: Danh Le / danh.danh20051995@gmail.com
 * Date: 2019-01-18 19:21:34
 */
import fs from 'fs'
import sharp from 'sharp'
const format = 'jpeg'

/**
 * Get meta data of an image
 * @param filePath String
 * @return {Promise}
 */
const getMeta = filePath => {
  return sharp(filePath).metadata()
}

/**
 * Resize image with input width and height-auto
 * @param inputPath String
 * @param outputPath String
 * @param width Number
 * @param height Number
 * @return {Promise}
 */
const resize = (inputPath, outputPath, width, height) => {
  let file = fs.readFileSync(inputPath)
  return sharp(file)
    .resize(width, height)
    .toFormat(format)
    .toFile(outputPath)
}

/**
 * Replace image with input width, height
 * @param filePath: String
 * @param width: Number
 * @param height: Number
 * @return {Promise}
 */
const resizeReplace = async (filePath, width, height) => {
  let file = fs.readFileSync(filePath)
  let buffer = await sharp(file)
    .resize(width, height)
    .toFormat(format)
    .toBuffer()

  fs.writeFileSync(filePath, buffer, 'binary')
  return getMeta(filePath)
}

/**
 * Make thumb image with inputis a image path, default thumb size 300px
 * @param inputPath String
 * @param outputPath String
 * @return {Promise}
 */
const makeThumb = async (inputPath, outputPath) => {
  let originMeta = await getMeta(inputPath)
  // let thumb300Path = outputPath.replace(/(\.[a-zA-Z0-9]*)$/g, '-300$1')
  if (originMeta.width < originMeta.height) {
    // await resize(inputPath, thumb300Path, 300)
    return resize(inputPath, outputPath, 300)
  }
  // await resize(inputPath, thumb300Path, null, 300)
  return resize(inputPath, outputPath, null, 300)
}

export default {
  getMeta,
  resize,
  resizeReplace,
  makeThumb
}
