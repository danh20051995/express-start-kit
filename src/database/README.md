# model

> Define sequelize model for app

## Structure Overview

```bash
├── README.md
├── config
├── custom
├── migrations
├── models
└── seeders
```

## models

This directory contains all app models. Checkout sequelize [`documentation`](https://sequelize.org/master/manual/model-basics.html) to understand how to define a new model.

e.g:

```js
import * as uuid from 'uuid'
// table name should be defined as a constant to avoid typo and consistently used by all places in the app
import { TABLE_BANNER } from '@/constants/table-name'

/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
 */
module.exports = (sequelize, DataTypes) => {
  const Banner = sequelize.define('Banner', {
    _id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuid.v4()
    },
    isShow: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: TABLE_BANNER,
    timestamps: true,
    paranoid: true,

    toObject: {
      transform: function (doc, ret) {
        delete ret.__v
      }
    }
  })

  Banner.beforeCreate(instance => {
    if (!instance._id) {
      instance._id = uuid.v4()
    }
  })

  return Banner
}
```

## migrations

We use PostgreSQL as database. Like any other code first approaches, every time you add a new model or do some modification on an existing model, these changes need to be reflected to the database. Sequelize has full support for migration.

```bash
# run new migrations
npm run migrate

# undo migration
npm run migrate:undo

# generate an empty migration for new model
npm run create:migration ${name}
```

Unfortunately, sequelize cli can not automatically relfect the changes for us, so we have to do it manually.

```js
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
```

## seeders

Insert fake data to table.

```bash
# create seeder
npm run create:seed

# run all seed
npm run seed

```

e.g:

```js
import { Config } from '@/config'
import { Op } from 'sequelize'
import { Administrator } from '@/database/models'
import { AuthenticateService } from '@/services/authenticate'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { USER_DEFAULT_PASSWORD = '123456' } = process.env
    const administrators = [ Config.get('package.author') ]

    const exists = await Administrator.findAll({
      raw: true,
      paranoid: !Administrator.options.paranoid,
      attributes: ['id', 'email'],
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
          name: email.split('@').shift(),
          username: email.split('@').shift(),
          password: AuthenticateService.hash(USER_DEFAULT_PASSWORD),
          createdAt: _now,
          updatedAt: _now
        })
      )

    if (docs.length) {
      await queryInterface.bulkInsert(
        Administrator.tableName,
        docs,
        {}
      )
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(Administrator.tableName, null, {
      email: {
        [Op.in]: administrators
      }
    }, {})
  }
}
```
