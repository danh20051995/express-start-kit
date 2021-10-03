import { Op } from 'sequelize'
import { validDateFormat } from '@/utils/date'
import { User } from '@/database/models'
import { AuthenticateService } from '@/services/authenticate'

const { USER_DEFAULT_PASSWORD = '123456' } = process.env

const user = {
  name: 'username',
  phone: '84123456789',
  birthday: '1995-01-01',
  password: AuthenticateService.hash(USER_DEFAULT_PASSWORD)
}
const usersPhone = [user].map(({ phone }) => phone)

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const exists = await User.findAll({
      raw: true,
      paranoid: !User.options.paranoid,
      attributes: ['id', 'phone'],
      where: {
        phone: { [Op.in]: usersPhone }
      }
    })

    const _now = new Date()
    const existsPhone = exists.map(u => u.phone)

    const docs = usersPhone
      .filter(phone => !existsPhone.includes(phone))
      .map(
        (phone, index) => ({
          ...user,
          createdAt: _now,
          birthday: validDateFormat(user.birthday, 'YYYY-MM-DD'),
          updatedAt: _now
        })
      )

    if (docs.length) {
      await queryInterface.bulkInsert(
        User.tableName,
        docs,
        {}
      )
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(User.tableName, null, {
      phone: { [Op.in]: usersPhone }
    }, {})
  }
}
