import * as uuid from 'uuid'

module.exports = (sequelize, DataTypes) => {
  const __STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
  }

  const User = sequelize.define('User', {
    _id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: function () {
        return uuid.v4()
      }
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
    }
  }, {
    tableName: 'Users',
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

  User.beforeCreate(instance => {
    if (!instance._id) {
      instance._id = uuid.v4()
    }
  })

  /**
   * associations
   */

  User.associate = function (models) {
    // associations can be defined here
    User.hasMany(models.Token, {
      sourceKey: '_id',
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
