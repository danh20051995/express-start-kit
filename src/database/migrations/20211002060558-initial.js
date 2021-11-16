import { Config } from '@/config'
import dbConfig from '../config'

module.exports = {
  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize')} Sequelize
   * @returns {Promise}
   */
  up: async (queryInterface, Sequelize) => {
    if (Config.get('db.dialect') === 'postgresql') {
      // clean all schema in db
      await queryInterface.sequelize.query(`ALTER SCHEMA public OWNER to ${dbConfig.get(process.env.NODE_ENV).username}`)
      await queryInterface.sequelize.query('DROP SCHEMA public CASCADE')
      await queryInterface.sequelize.query('CREATE SCHEMA public')

      // uuid plugin
      await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    }
  },

  /**
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {import('sequelize')} Sequelize
   * @returns {Promise}
   */
  down: async (queryInterface, Sequelize) => {}
}
