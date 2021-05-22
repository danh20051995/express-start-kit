import * as uuid from 'uuid'

module.exports = (sequelize, DataTypes) => {
  const _TYPE = {
    AUTHENTICATE: 'authenticate',
    RESET: 'reset'
  }

  const Token = sequelize.define('Token', {
    _id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: function () {
        return uuid.v4()
      }
    },
    userId: {
      type: DataTypes.UUID
    },
    adminId: {
      type: DataTypes.UUID
    },
    type: {
      type: DataTypes.ENUM(...Object.values(_TYPE)),
      defaultValue: _TYPE.AUTHENTICATE
    },
    key: {
      type: DataTypes.STRING
    },
    token: {
      type: DataTypes.TEXT
    },
    refreshToken: {
      type: DataTypes.TEXT
    },
    fcmToken: {
      type: DataTypes.STRING
    },
    expiredAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'Tokens',
    timestamps: true,

    // // https://sequelize.org/master/manual/paranoid.html
    // paranoid: true,
    // // deletedAt: 'destroyTime' // custom deletedAt field name

    toObject: {
      transform: function (doc, ret) {
        delete ret.__v
      }
    }
  })

  /**
   * hooks
   */

  Token.beforeCreate(instance => {
    if (!instance._id) {
      instance._id = uuid.v4()
    }
  })

  /**
   * associations
   */

  Token.associate = function (models) {
    // // associations with default id
    // Token.belongsTo(models.User, {
    //   foreignKey: 'userId',
    //   as: 'creator',
    //   onDelete: 'CASCADE'
    // })

    // associations with default _id
    Token.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: '_id',
      as: 'user',
      onDelete: 'CASCADE'
    })

    // associations with default _id
    Token.belongsTo(models.Administrator, {
      foreignKey: 'adminId',
      targetKey: '_id',
      as: 'administrator',
      onDelete: 'CASCADE'
    })
  }

  /**
   * model statics
   */

  Token._TYPE = _TYPE

  /**
   * model instance properties
   */

  Token.prototype._TYPE = _TYPE

  return Token
}
