const mw = require('./config/middleware.js');
const app = mw.express();

//middleware and routes
app.use(
  require('morgan')('dev'),
  mw.bodyParser.json(),
  mw.bodyParser.urlencoded({extended: true}),
  // require('express-session')({ TO BE IMPLEMENTED L8Z
  //   secret: 'It\'s a SECRET', //https://www.youtube.com/watch?v=gMUEFZXkmDAw
  //   saveUninitialized: false,
  //   resave: true
  // }),
  mw.express.static(`${__dirname}/../public`), 
  require('./resources/router.js')
);

module.exports = app;