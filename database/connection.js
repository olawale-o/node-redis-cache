const knex = require('knex');
const dbConfig = require('./knexfile');

const ENV = 'development';

let db = null;

if (ENV === 'test') {
  db = knex(dbConfig.test);
} else {
  db = knex(dbConfig.development);
}

module.exports = db;