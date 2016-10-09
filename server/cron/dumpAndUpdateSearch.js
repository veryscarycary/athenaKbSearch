const utils = require('../resources/utils/utils');
const client = require('../elasticsearch');
const mw = require('../config/middleware');
const CronJob = require('cron').CronJob;

module.exports = () => (
  new CronJob('0 0 0 * * *',  () => {
    console.log('cron task activated');
    utils.clearAllDocuments()
      .then(() => {
        getAllFromDb('kb')
          .then((docs) => {
            utils.bulkAdd(docs, 'kb')
          })
      })
      .then(() => {
        getAllFromDb('ticket')
          .then(docs => {
            utils.bulkAdds(docs, 'ticket')
          })
      })
      .catch(err => {
        console.log(err);
      })
  },true,'America/San_Francisco')
)
