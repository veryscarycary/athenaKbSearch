const utils = require('../resources/utils/utils');
const client = require('../elasticsearch');
const mw = require('../config/middleware');
const CronJob = require('cron').CronJob;

var hardUpdate = new CronJob('0 0 0 * * *',  () => {
  console.log('cron task activated');
  utils.clearAllDocuments()
  .then(() => {
    utils.getAllFromDb('kb')
    .then((docs) => {
      utils.bulkAdd(docs, 'kb')
    })
  })
  .then(() => {
    utils.getAllFromDb('ticket')
    .then(docs => {
      utils.bulkAdds(docs, 'ticket')
    })
  })
  .catch(err => {
    hardUpdate.stop();
    console.log(err);
  })
},true,'America/San_Francisco')

module.exports = hardUpdate;
