'use strict'
const mw = require('./config/middleware.js');
//set port to default port or POST variable provided by user
const port = process.argv[2] || mw.urls.kb.default;
const softUpdate = require('./cron/softUpdateSearch');
const hardUpdate = require('./cron/dumpAndUpdateSearch');

//set server to listen to port

require('./server.js').listen(port, () => {
  softUpdate();
  hardUpdate();
  console.log(mw.chalk.green.bold(`\n Athena KB Search RESTful API listening on port ${port}.`))
});
