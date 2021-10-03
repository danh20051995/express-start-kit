import { TABLE_ADMINISTRATOR, TABLE_TOKEN, TABLE_USER } from '@/constants/table-name'

module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize')} Sequelize
   * @returns {Promise}
   */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(TABLE_TOKEN, {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: true,
        onDelete: 'CASCADE',
        references: {
          model: TABLE_USER,
          key: 'id',
          as: 'user'
        }
      },
      adminId: {
        type: Sequelize.BIGINT,
        allowNull: true,
        onDelete: 'CASCADE',
        references: {
          model: TABLE_ADMINISTRATOR,
          key: 'id',
          as: 'administrator'
        }
      },
      type: {
        type: Sequelize.STRING,
        // type: Sequelize.ENUM('authenticate', 'reset'),
        defaultValue: 'authenticate'
      },
      key: {
        type: Sequelize.STRING
      },
      token: {
        type: Sequelize.TEXT
      },
      refreshToken: {
        type: Sequelize.TEXT
      },
      expiredAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      refreshExpiredAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      fcmToken: {
        type: Sequelize.STRING
      },
      device: {
        allowNull: true,
        type: Sequelize.STRING
      },
      os: {
        allowNull: true,
        type: Sequelize.STRING
      },
      ip: {
        allowNull: true,
        type: Sequelize.STRING
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    })
  },

  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize')} Sequelize
   * @returns {Promise}
   */
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable(TABLE_TOKEN)
  }
}
