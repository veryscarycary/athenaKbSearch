const utils = require('../resources/utils/utils');
const client = require('../elasticsearch');
const mw = require('../config/middleware');
const CronJob = require('cron').CronJob;

const softUpdate = new CronJob('0 */5 * * * *',  () => {
console.log('cron task activated: ', new Date());
utils.clearAllDocuments('kb')
.then(resp => {
  utils.clearAllDocuments('ticket')
})
.then(() => {
  utils.getLatestDate('kb')
  .then(date => {
    utils.getAllFromDb({dateSubmitted: {$gte: date}}, 'kb')
    .then(newDocs => {
      utils.getAllFromDb({dateLastEdited: {$gte: date}}, 'kb')
      .then(updatedDocs => {
        var allDocs = newDocs.concat(updatedDocs);
        utils.bulkAdd(allDocs, 'kb')
      })
    })
  })
})
//.then(() => {
//utils.getLatestDate('ticket')
//.then(date => {
//utils.getAllFromDb({dateSubmitted: {$gte: date}}, 'ticket')
//.then(newDocs => {
//utils.getAllFromDb({dateLastEdited: {$gte: date}}, 'ticket')
//.then(updatedDocs => {
//var allDocs = newDocs.concat(updatedDocs);
//utils.bulkAdd(allDocs, 'ticket')
//})
//})
//})
//})
.catch(err => {
  softUpdate.stop();
  console.log('Error creating cron task: ', new Date(), err);
})
},true,'America/San_Francisco')

module.exports = softUpdate;
