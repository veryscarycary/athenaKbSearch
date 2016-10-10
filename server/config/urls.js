'use strict'
const DIALECT = 'postgres';//'postgres';
const HOST = 'localhost';
const MASTER_HOST = 'localhost';
const PORT = 5432;
const KDB = 'kb';
const TDB = 'ticket';
const DB = 'kbSearch';
const DB_USR = require('./dbAuth.js').DB_USR;
const DB_PASS = require('./dbAuth.js').DB_PASS;
// const DB_USR = require('./dbAuth.js').DB_USR;
// const DB_PASS = require('./dbAuth.js').DB_PASS;
//const TMASTER_DB = 'ticket';


module.exports = {
  kb: {
    default: 3004,
    //database: `${DIALECT}://${HOST}/${DB}`,
    //masterDatabase: `${DIALECT}://${MASTER_HOST}:27017/${KMASTER_DB}`,
    //masterDatabaseName: KMASTER_DB
    database: `${DIALECT}://${DB_USR}:${DB_PASS}@${HOST}:${ PORT}/${KDB}`,
    //databaseDefault: `${DIALECT}://${DB_USR}:${DB_PASS}@${HOST}:${PORT}/${DIALECT}`
  },
  ticket: {
    default: 3004,
    //database: `${DIALECT}://${HOST}/${DB}`,
    masterDatabase: `mongodb://${MASTER_HOST}:27017/${TDB}`,
    masterDatabaseName: 'TDB',
  }
};
