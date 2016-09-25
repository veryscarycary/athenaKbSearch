const mw = require('../config/middleware.js');
const Sequelize = mw.sequelize;
const schemaName = 'kb_schema';
const db = new Sequelize(mw.urls.database, {
  schema: schemaName,
  
});

module.exports = {
  db: db
};



// let Kb = db.define('Kb', {
  
// })
