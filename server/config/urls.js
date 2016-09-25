const PSQL = 'postgres';
const URI = 'localhost';
const PORT = 5432;
const DB = 'kb';
const DB_USR = require('./dbAuth.js').DB_USR;
const DB_PASS = require('./dbAuth.js').DB_PASS;

module.exports = {
  default: 3003,
  database: `${PSQL}://${DB_USR}:${DB_PASS}@${URI}:${PORT}/${DB}`,
  databaseDefault: `${PSQL}://${DB_USR}:${DB_PASS}@${URI}:${PORT}/${PSQL}`
};