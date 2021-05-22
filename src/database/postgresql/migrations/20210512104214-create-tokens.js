module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Tokens', {
      _id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.fn('uuid_generate_v4')
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: true,
        onDelete: 'CASCADE',
        references: {
          model: 'Users',
          key: '_id',
          as: 'userId'
        }
      },
      adminId: {
        type: Sequelize.UUID,
        allowNull: true,
        onDelete: 'CASCADE',
        references: {
          model: 'Administrators',
          key: '_id',
          as: 'adminId'
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
      fcmToken: {
        type: Sequelize.STRING
      },
      expiredAt: {
        allowNull: true,
        type: Sequelize.DATE
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Tokens')
  }
}
