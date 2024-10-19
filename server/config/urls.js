'use strict'
const DB_AUTH = require('./dbAuth.js');

const DIALECT = 'postgres';//'postgres';
const HOST = 'localhost';
const MASTER_HOST = 'localhost';
const PORT = 5432;
const KDB = 'kb';
const TDB = 'ticket';
const DB = 'kbSearch';
const DB_USR = process.env.DB_USR || DB_AUTH.DB_USR;
const DB_PASS = process.env.DB_PASS || DB_AUTH.DB_PASS;
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
    database: `${DIALECT}://${DB_USR}:${DB_PASS}@${HOST}:${ PORT}/${TDB}`,
}
};
