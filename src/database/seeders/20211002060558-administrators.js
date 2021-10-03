import Config from 'config'
import { Op } from 'sequelize'
import { Administrator } from '@/database/models'
import { AuthenticateService } from '@/services/authenticate'

const { USER_DEFAULT_PASSWORD = '123456' } = process.env

const administrators = [
  Config.get('package.author')
]

module.exports = {
  administrators,

  up: async (queryInterface, Sequelize) => {
    const exists = await Administrator.findAll({
      raw: true,
      paranoid: !Administrator.options.paranoid,
      attributes: ['id', 'email'],
      where: {
        email: {
          [Op.in]: administrators
        }
      }
    })

    const _now = new Date()
    const emails = exists.map(u => u.email)

    const docs = administrators
      .filter(email => !emails.includes(email))
      .map(
        email => ({
          email,
          name: email.split('@').shift(),
          username: email.split('@').shift(),
          password: AuthenticateService.hash(USER_DEFAULT_PASSWORD),
          createdAt: _now,
          updatedAt: _now
        })
      )

    if (docs.length) {
      await queryInterface.bulkInsert(
        Administrator.tableName,
        docs,
        {}
      )
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(Administrator.tableName, null, {
      email: {
        [Op.in]: administrators
      }
    }, {})
  }
}
