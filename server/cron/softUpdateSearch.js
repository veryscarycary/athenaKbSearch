const utils = require('../resources/utils/utils');
const client = require('../elasticsearch');
const mw = require('../config/middleware');
const CronJob = require('cron').CronJob;

module.exports = () => (
  new CronJob('0 */5 * * * *',  () => {
    console.log('cron task activated: ', new Date());
    utils.clearAllDocuments('kb')
    .then(resp => {
      utils.clearAllDocuments('ticket')
    })
      .then(() => {
        getLatestDate('kb')
          .then(date => {
            getAllFromDb({dateSubmitted: {$gte: date}}, 'kb')
              .then(newDocs => {
                getAllFromDb({dateLastEdited: {$gte: date}}, 'kb')
                  .then(updatedDocs => {
                    var allDocs = newDocs.concat(updatedDocs);
                    utils.bulkAdd(allDocs, 'kb')
                  })
              })
          })
      })
      .then(() => {
        getLatestDate('ticket')
          .then(date => {
            getAllFromDb({dateSubmitted: {$gte: date}}, 'ticket')
              .then(newDocs => {
                getAllFromDb({dateLastEdited: {$gte: date}}, 'ticket')
                  .then(updatedDocs => {
                    var allDocs = newDocs.concat(updatedDocs);
                    utils.bulkAdd(allDocs, 'ticket')
                  })
              })
          })
      })
      .catch(err => {
        console.log('Error creating cron task: ', new Date(), err);
      })
  },true,'America/San_Francisco')
)
