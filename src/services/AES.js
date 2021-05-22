import Joi from 'joi'
import crypto from 'crypto'

export const _IV_SIZE = 16 // 128 bits | 16 bytes
export const modes = {
  ECB: 'ECB', // mode: Electronic Code Book mode
  CBC: 'CBC', // mode: Cipher Block Chaining mode
  CFB: 'CFB', // mode: Cipher FeedBack mode
  OFB: 'OFB', // mode: Output FeedBack mode
  CTR: 'CTR' // mode: Counter mode
}

const aesValidator = Joi.object({
  mode: Joi.string().uppercase().valid(...Object.values(modes)).required(),
  key: Joi.any().required(),
  iv: Joi.any().required()
})

export class AES {
  /**
    * @param {Buffer} key secret key
    * @param {Buffer} iv
    * @param {string} mode
    */
  constructor ({ key, iv, mode } = {}) {
    const { error } = aesValidator.validate({ key, iv, mode })
    if (error) {
      throw error
    }

    this._iv = iv
    this._key = key
    this._mode = mode.toLowerCase()
    this._algorithm = this.detectAlgorithm()
  }

  detectAlgorithm () {
    if (this._iv.length !== _IV_SIZE) {
      throw new Error('Invalid IV length, IV must be 128 bits.')
    }

    switch (this._key.length) {
      case 16:
        return `aes-128-${this._mode}`
      case 24:
        return `aes-192-${this._mode}`
      case 32:
        return `aes-256-${this._mode}`
      default:
        throw new Error('Invalid key length: ' + this._key.length)
    }
  }

  /**
     * Encrypt data
     * @param {any} data
     * @param {string} inputEncoding
     * @param {string} outputEncoding
     * @returns {Base64}
     */
  encrypt (data, inputEncoding, outputEncoding) {
    const cipher = crypto.createCipheriv(this._algorithm, this._key, this._iv)

    if (outputEncoding) {
      let encrypted = cipher.update(data, inputEncoding, outputEncoding)
      encrypted += cipher.final(outputEncoding)
      return encrypted
    }

    return Buffer.concat([
      cipher.update(data, inputEncoding),
      cipher.final()
    ])
  }

  /**
     * Decrypt encrypted data
     * @param {string} encrypted
     * @param {string} inputEncoding
     * @param {string} outputEncoding
     * @returns {string}
     */
  decrypt (encrypted, inputEncoding, outputEncoding) {
    // const bufferInputLength = (inputEncoding && Buffer.from(encrypted, inputEncoding).length) || Buffer.from(encrypted).length
    // const _invalidEncryptedSize = bufferInputLength / _IV_SIZE % 1
    // if (_invalidEncryptedSize) {
    //   throw new Error('Invalid encrypted data')
    // }

    const decipher = crypto.createDecipheriv(this._algorithm, this._key, this._iv)

    if (outputEncoding) {
      let decrypted = decipher.update(encrypted, inputEncoding, outputEncoding)
      decrypted += decipher.final(outputEncoding)
      return decrypted
    }

    return Buffer.concat([
      decipher.update(encrypted, inputEncoding),
      decipher.final()
    ])
  }
}
