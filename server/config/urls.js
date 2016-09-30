'use strict'
const DIALECT = 'mongodb';//'postgres';
const HOST = 'localhost';
const MASTER_HOST = 'localhost';
// const PORT = 5432;
const MASTER_DB = 'kb';
const DB = 'kbSearch';
// const DB_USR = require('./dbAuth.js').DB_USR;
// const DB_PASS = require('./dbAuth.js').DB_PASS;

module.exports = {
  default: 3004,
  database: `${DIALECT}://${HOST}/${DB}`,
  masterDatabase: `${DIALECT}://${MASTER_HOST}:27017/${MASTER_DB}`,
  masterDatabaseName: MASTER_DB
  // database: `${DIALECT}://${DB_USR}:${DB_PASS}@${HOST}:${PORT}/${DB}`,
  // databaseDefault: `${DIALECT}://${DB_USR}:${DB_PASS}@${HOST}:${PORT}/${DIALECT}`
};
