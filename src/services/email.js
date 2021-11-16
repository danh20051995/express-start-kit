import Joi from 'joi'
import nodemailer from 'nodemailer'
import { Config } from '@/config'

/* Initialize email service */
const { transport, defaults } = Config.get('mailer')

const mailer = nodemailer.createTransport(transport)

/**
 * Valid input is an Array
 * @param {any} arr
 * @returns {any[]}
 */
const ensureArray = (arr, defaultValue) => Array.isArray(arr)
  ? arr
  : Array.isArray(defaultValue) ? defaultValue : []

/**
 * Class: EmailService
 */
export class EmailService {
  #from
  #to
  #subject
  #text
  #html
  #messageId
  #cc
  #bcc
  #attachments

  /**
   * @param {Partial<import('nodemailer/lib/mailer').Options>}
   */
  constructor ({
    from = defaults.from,
    to = defaults.to,
    subject = defaults.subject,
    text = defaults.text,
    html = defaults.html,
    messageId,
    cc,
    bcc,
    attachments
  } = {}) {
    this.#from = from
    this.#to = to
    this.#subject = subject
    this.#text = text
    this.#html = html
    this.#messageId = messageId
    this.#cc = ensureArray(cc, cc ? [cc] : [])
    this.#bcc = ensureArray(bcc, bcc ? [bcc] : [])
    this.#attachments = ensureArray(attachments, attachments ? [attachments] : [])
  }

  /**
   * SECTION: static methods
   */

  static create = () => new EmailService()
  static to = (email) => EmailService.create().to(email)
  static subject = (subject) => EmailService.create().subject(subject)
  static text = (text) => EmailService.create().text(text)
  static html = (html) => EmailService.create().html(html)
  static cc = (mail) => EmailService.create().cc(mail)
  static bcc = (mail) => EmailService.create().bcc(mail)
  static attach = (attachment) => EmailService.create().attach(attachment)
  static detach = (index) => EmailService.create().detach(index)

  /**
   * SECTION: getter
   */

  get _emailOptions () {
    return {
      from: this.#from,
      to: this.#to,
      subject: this.#subject,
      text: this.#text,
      html: this.#html,
      messageId: this.#messageId,
      cc: this.#cc,
      bcc: this.#bcc,
      attachments: this.#attachments
    }
  }

  _validMail (mail) {
    if (process.isProd) {
      return mail
    }

    return Config.get('package.author')
  }

  _data () {
    const emailSchema = Joi.string().email()
    const configSchema = Joi.object({
      from: [
        Joi.string().regex(/\S+@\S+\.\S+/).required(),
        emailSchema.required()
      ],
      to: emailSchema.required(),
      subject: Joi.string().required(),
      text: Joi.string(),
      html: Joi.when('text', {
        is: Joi.string().required(),
        then: Joi.strip(),
        otherwise: Joi.string().required()
      }),
      messageId: [
        Joi.string().required(),
        Joi.strip()
      ],
      cc: Joi.array().unique().items(emailSchema),
      bcc: Joi.array().unique().items(emailSchema),
      attachments: Joi.array().items(
        Joi.alternatives([
          Joi.object({
            filename: [
              Joi.string().required(),
              Joi.strip()
            ],
            path: Joi.string().required() // filepath or file URL attachment
          }),
          Joi.object({
            filename: Joi.string().required(),
            content: Joi.string().required(),
            contentType: [
              Joi.string().required(),
              Joi.strip()
            ],
            encoding: [
              Joi.string().required(),
              Joi.strip()
            ]
          })
        ])
      )
    })

    const { error, value } = configSchema.validate(
      this._emailOptions,
      { abortEarly: false }
    )

    if (error) {
      throw error
    }

    return value
  }

  /**
   * SECTION: class methods
   */

  to (email) {
    const _m = this._validMail(email)
    this.#to = _m
    return this
  }

  subject (subject) {
    this.#subject = subject
    return this
  }

  text (text) {
    this.#text = text
    return this
  }

  html (html) {
    this.#html = html
    return this
  }

  cc (email) {
    for (const m of ensureArray(email, [email])) {
      const _m = this._validMail(m)
      if (!this.#cc.includes(_m)) {
        this.#cc.push(_m)
      }
    }

    return this
  }

  bcc (email) {
    for (const m of ensureArray(email)) {
      const _m = this._validMail(m)
      if (!this.#bcc.includes(_m)) {
        this.#bcc.push(_m)
      }
    }

    return this
  }

  attach (attachment) {
    this.#attachments.push(attachment)
    return this
    // const attachments = [
    //   { // utf-8 string as an attachment
    //     filename: 'text1.txt',
    //     content: 'hello world!'
    //   },
    //   { // binary buffer as an attachment
    //     filename: 'text2.txt',
    //     content: Buffer.from('hello world!', 'utf-8')
    //   },
    //   { // file on disk as an attachment
    //     filename: 'text3.txt',
    //     path: '/path/to/file.txt' // stream this file
    //   },
    //   { // filename and content type is derived from path
    //     path: '/path/to/file.txt'
    //   },
    //   { // stream as an attachment
    //     filename: 'text4.txt',
    //     content: fs.createReadStream('/path/to/file.txt')
    //   },
    //   { // define custom content type for the attachment
    //     filename: 'text.bin',
    //     content: 'hello world!',
    //     contentType: 'text/plain'
    //   },
    //   { // use URL as an attachment
    //     filename: 'license.txt',
    //     path: 'https://raw.github.com/andris9/Nodemailer/master/LICENSE'
    //   },
    //   { // encoded string as an attachment
    //     filename: 'text1.txt',
    //     content: 'aGVsbG8gd29ybGQh',
    //     encoding: 'base64'
    //   },
    //   { // data uri as an attachment
    //     path: 'data:text/plain;base64,aGVsbG8gd29ybGQ='
    //   }
    // ]
  }

  detach (index) {
    this.#attachments.splice(index, 1)
    return this
  }

  send () {
    return mailer.sendMail(this._data())
  }
}
