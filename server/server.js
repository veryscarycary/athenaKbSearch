'use strict' 
const mw = require('./config/middleware.js');
require('./db/index.js');
const app = mw.express();

//middleware and routes
app.use(
  require('morgan')('dev'),
  mw.bodyParser.json(),
  mw.bodyParser.urlencoded({extended: true}),
  require('./resources/router.js')
);

module.exports = app;