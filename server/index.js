'use strict'
const mw = require('./config/middleware.js');
//set port to default port or POST variable provided by user
const port = process.argv[2] || mw.urls.kb.default;
const initializeKb = require('./resources/utils/initializeKb');
const initializeTicket = require('./resources/utils/initializeTicket');
//set server to listen to port

require('./server.js').listen(port, () => {
  initializeKb();
  initializeTicket();
//  require('./cron/softUpdateSearch');
  // require('./cron/dumpAndUpdateSearch');
  console.log(mw.chalk.green.bold(`\n Athena KB Search RESTful API listening on port ${port}.`))
});
