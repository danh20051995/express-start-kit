import { TABLE_ADMINISTRATOR } from '@/constants/table-name'
import { generateUniq } from '@/database/custom/statics'

/**
 * @param {import('sequelize/lib/sequelize')} sequelize
 * @param {import('sequelize')} DataTypes
 * @returns {import('sequelize/lib/model')}
 */
module.exports = (sequelize, DataTypes) => {
  const __STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
  }

  const Administrator = sequelize.define('Administrator', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    },
    username: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM(...Object.values(__STATUS)),
      defaultValue: __STATUS.ACTIVE
    }
  }, {
    tableName: TABLE_ADMINISTRATOR,
    timestamps: true,

    // https://sequelize.org/master/manual/paranoid.html
    paranoid: true,
    // deletedAt: 'destroyTime' // custom deletedAt field name

    toObject: {
      transform: function (doc, ret) {
        delete ret.__v
      }
    }
  })

  /**
   * hooks
   */

  // Administrator.beforeCreate(instance => {})

  /**
   * associations
   */

  Administrator.associate = function (models) {
    // associations can be defined here
    Administrator.hasMany(models.Token, {
      sourceKey: 'id',
      foreignKey: 'adminId',
      as: 'tokens'
    })
  }

  /**
   * model statics
   */

  Administrator.__STATUS = __STATUS
  Administrator.uniqField = 'username'
  Administrator.generateUsername = generateUniq

  /**
   * model instance properties
   */

  Administrator.prototype.__STATUS = __STATUS

  return Administrator
}
