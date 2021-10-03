import { TABLE_USER } from '@/constants/table-name'

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

  const User = sequelize.define('User', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    },
    phone: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM(...Object.values(__STATUS)),
      defaultValue: __STATUS.ACTIVE
    },
    birthday: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    tableName: TABLE_USER,
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

  // User.beforeCreate(instance => {})

  /**
   * associations
   */

  User.associate = function (models) {
    // associations can be defined here
    User.hasMany(models.Token, {
      sourceKey: 'id',
      foreignKey: 'userId',
      as: 'tokens'
    })
  }

  /**
   * model statics
   */

  User.__STATUS = __STATUS

  /**
   * model instance properties
   */

  User.prototype.__STATUS = __STATUS

  return User
}
