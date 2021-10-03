import { Op } from 'sequelize'
import { TABLE_TOKEN } from '@/constants/table-name'

/**
 * @param {import('sequelize/lib/sequelize')} sequelize
 * @param {import('sequelize')} DataTypes
 * @returns {import('sequelize/lib/model')}
 */
module.exports = (sequelize, DataTypes) => {
  const __TYPE = {
    AUTHENTICATE: 'authenticate',
    RESET: 'reset'
  }

  const Token = sequelize.define('Token', {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT
    },
    type: {
      type: DataTypes.ENUM(...Object.values(__TYPE)),
      defaultValue: __TYPE.AUTHENTICATE
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
    expiredAt: {
      type: DataTypes.DATE
    },
    refreshExpiredAt: {
      type: DataTypes.DATE
    },
    fcmToken: {
      type: DataTypes.STRING
    },
    device: {
      type: DataTypes.STRING
    },
    os: {
      type: DataTypes.STRING
    },
    ip: {
      type: DataTypes.STRING
    }
  }, {
    tableName: TABLE_TOKEN,
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

  // Token.beforeCreate(instance => {})

  /**
   * associations
   */

  Token.associate = function (models) {
    // associations with default id
    Token.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
      as: 'user'
    })
    // associations with default id
    Token.belongsTo(models.Administrator, {
      foreignKey: 'adminId',
      targetKey: 'id',
      as: 'administrator'
    })
  }

  /**
   * model statics
   */

  Token.__TYPE = __TYPE

  /**
   * Expire token by id
   * @param {number} tokenId
   */
  Token.expire = async function expire (tokenId) {
    const _now = new Date()

    await Token.update(
      {
        expiredAt: _now,
        refreshExpiredAt: _now
      },
      {
        where: {
          id: tokenId,
          // expiredAt: { [Op.gt]: _now },
          refreshExpiredAt: { [Op.gt]: _now }
        }
      }
    )

    return _now
  }

  /**
   * model instance properties
   */
  Token.prototype.__TYPE = __TYPE

  /**
   * Expire current token
   */
  Token.prototype.expire = async function expire () {
    const _now = new Date()
    this.expiredAt = _now
    this.refreshExpiredAt = _now
    await this.save()
    return _now
  }

  return Token
}
