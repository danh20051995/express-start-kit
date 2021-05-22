import * as uuid from 'uuid'
import slugify from 'slugify'
import { Op } from 'sequelize'

module.exports = (sequelize, DataTypes) => {
  const __STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
  }

  const Administrator = sequelize.define('Administrator', {
    _id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: function () {
        return uuid.v4()
      }
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
    tableName: 'Administrators',
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

  Administrator.beforeCreate(instance => {
    if (!instance._id) {
      instance._id = uuid.v4()
    }
  })

  /**
   * associations
   */

  Administrator.associate = function (models) {
    // associations can be defined here
    Administrator.hasMany(models.Token, {
      sourceKey: '_id',
      foreignKey: 'adminId',
      as: 'tokens'
    })
  }

  /**
   * model statics
   */

  Administrator.__STATUS = __STATUS
  Administrator.generateUsername = async function generateUsername (name, num = 0) {
    const slugStr = String(num ? name + ' ' + num : name)
    const username = slugify(slugStr).toLowerCase()
    const count = await this.count({
      where: {
        username: {
          [Op.substring]: username
        }
      }
    })

    // debug performance
    if (process.env.NODE_ENV === 'development') {
      console.log('Generate administrator username count: username | ', count)
    }

    if (!count) {
      return username
    }

    return this.generateUsername(name, count + 1)
  }

  /**
   * model instance properties
   */

  Administrator.prototype.__STATUS = __STATUS

  return Administrator
}
