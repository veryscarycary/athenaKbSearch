const utils = require('../resources/utils/utils');
const client = require('../elasticsearch');
const mw = require('../config/middleware');
const CronJob = require('cron').CronJob;

var hardUpdate = new CronJob('15 * * * * *',  () => {
  console.log('cron task activated');
  utils.clearAllDocuments()
  .then(() => {
    console.log('DOCUMENTS CLEARED');
    utils.getAllFromDb(null, 'kb')
    .then((docs) => {
      console.log('HARDUPDATE BULK ADDS KB:', docs);

      utils.bulkAdd(docs, 'kb')
    })
  })
  .then(() => {
    utils.getAllFromDb(null, 'ticket')
    .then(docs => {
      console.log('HARDUPDATE BULK ADDS TICKET:', docs);

      utils.bulkAdd(docs, 'ticket')
    })
  })
  .catch(err => {
    hardUpdate.stop();
    console.log('HARD UPDATE ERR: ' + err);
  })
},true,'America/San_Francisco')

module.exports = hardUpdate;
