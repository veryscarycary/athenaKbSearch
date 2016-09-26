const DIALECT = 'mongodb';//'postgres';
const HOST = 'localhost';
// const PORT = 5432;
const DB = 'kb';
// const DB_USR = require('./dbAuth.js').DB_USR;
// const DB_PASS = require('./dbAuth.js').DB_PASS;

module.exports = {
  default: 3003,
  database: `${DIALECT}://${HOST}/${DB}`
  // database: `${DIALECT}://${DB_USR}:${DB_PASS}@${HOST}:${PORT}/${DB}`,
  // databaseDefault: `${DIALECT}://${DB_USR}:${DB_PASS}@${HOST}:${PORT}/${DIALECT}`
};