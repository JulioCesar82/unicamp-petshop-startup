const knex = require('knex');
const { dbConfig } = require('../../config/database');

const knexInstance = knex({
  client: 'pg',
  connection: dbConfig,
  pool: {
    min: 2,
    max: 10
  }
});

module.exports = knexInstance;
