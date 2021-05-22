import * as uuid from 'uuid'
import { Op } from 'sequelize'
import { AuthenticateService } from '@/services/authenticate'
import { Administrator } from '@/database/postgresql/models'

const administrators = [
  'danh.danh20051995@gmail.com'
]

module.exports = {
  administrators,

  up: async (queryInterface, Sequelize) => {
    const exists = await Administrator.findAll({
      raw: true,
      attributes: ['_id', 'email'],
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
          _id: uuid.v4(),
          username: email.split('@').shift(),
          password: AuthenticateService.hash('123456789'),
          createdAt: _now,
          updatedAt: _now
        })
      )

    if (docs.length) {
      await queryInterface.bulkInsert(
        'Administrators',
        docs,
        {}
      )
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Administrators', null, {
      email: {
        [Op.in]: administrators
      }
    }, {})
  }
}
