'use strict'
const DIALECT = 'mongodb';//'postgres';
const HOST = 'localhost';
const MASTER_HOST = 'localhost';
// const PORT = 5432;
const KMASTER_DB = 'kb';
const DB = 'kbSearch';
// const DB_USR = require('./dbAuth.js').DB_USR;
// const DB_PASS = require('./dbAuth.js').DB_PASS;

const TMASTER_DB = 'ticket';

module.exports = {
  kb: {
    default: 3004,
    //database: `${DIALECT}://${HOST}/${DB}`,
    masterDatabase: `${DIALECT}://${MASTER_HOST}:27017/${KMASTER_DB}`,
    masterDatabaseName: KMASTER_DB
    // database: `${DIALECT}://${DB_USR}:${DB_PASS}@${HOST}:${PORT}/${DB}`,
    // databaseDefault: `${DIALECT}://${DB_USR}:${DB_PASS}@${HOST}:${PORT}/${DIALECT}`
  },
  ticket: {
    default: 3004,
    //database: `${DIALECT}://${HOST}/${DB}`,
    masterDatabase: `${DIALECT}://${MASTER_HOST}:27017/${TMASTER_DB}`,
    masterDatabaseName: TMASTER_DB
  }
};
