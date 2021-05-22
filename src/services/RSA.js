import NodeRSA from 'node-rsa'

// // Generate new key 1024 bits
// const genKey = new NodeRSA({ b: 1024 })
// genKey.generateKeyPair()

// // https://en.wikipedia.org/wiki/PKCS_8
// console.log(genKey.exportKey('pkcs8-public'))
// console.log(genKey.exportKey('pkcs8-private'))

export class RSA {
  /**
    * @param {NodeRSA.Key} publicKey RSA public key pem
    * @param {NodeRSA.Key} privateKey RSA private key pem
    */
  constructor ({ publicKey, privateKey } = {}) {
    this.publicKey = publicKey
    this.privateKey = privateKey

    if (this.publicKey) {
      this._publicKey = new NodeRSA(this.publicKey)
    }

    if (this.privateKey) {
      this._privateKey = new NodeRSA(this.privateKey)
    }
  }

  /**
    * Encrypt with public key
    * @param  {...any} args
    */
  encrypt (...args) {
    if (!this._publicKey) {
      throw new Error('"publicKey" is missing.')
    }

    return this._publicKey.encrypt(...args)
  }

  /**
    * Decrypt with private key
    * @param  {...any} args
    */
  decrypt (...args) {
    if (!this._privateKey) {
      throw new Error('"privateKey" is missing.')
    }

    return this._privateKey.decrypt(...args)
  }
}
