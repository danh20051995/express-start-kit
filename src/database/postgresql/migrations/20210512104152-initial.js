// ALTER SCHEMA public OWNER to <username>;
// DROP SCHEMA public CASCADE;
// CREATE SCHEMA public;
const dbConfig = require('../config')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // clean all schema in db
    await queryInterface.sequelize.query(`ALTER SCHEMA public OWNER to ${dbConfig.get(process.env.NODE_ENV).username}`)
    await queryInterface.sequelize.query('DROP SCHEMA public CASCADE')
    await queryInterface.sequelize.query('CREATE SCHEMA public')

    // uuid plugin
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  },
  down: async (queryInterface, Sequelize) => {}
}
