const utils = require('../resources/utils/utils');
const client = require('../elasticsearch');
const mw = require('../config/middleware');
const CronJob = require('cron').CronJob;


const softUpdate = new CronJob('0 * * * * *', () => {
  console.log('cron task activated: ', new Date());
  utils.getLatestDate('kb')
  .then(date => {
    if (date) {
      utils.getAllFromDb("SELECT * FROM articles WHERE 'createdAt' > ${date}", 'kb')
        .then(newDocs => {
          utils.getAllFromDb("SELECT * FROM articles WHERE 'updatedAt' > ${date}", 'kb')
            .then(updatedDocs => {
              var allDocs = newDocs ? newDocs.concat(updatedDocs) : updatedDocs;
              if (allDocs) {
                console.log('SOFTUPDATE ALLDOCS KB: ', docs);

                utils.bulkAdd(allDocs, 'kb')
              };
            })
          })
        } else {
          resolve('updated');
        }
      })
      .then(utils.getLatestDate('ticket')
        .then(date => {
          if (date) {
            utils.getAllFromDb("SELECT * FROM tickets WHERE 'createdAt' > ${date}", 'ticket')
              .then(newDocs => {
                utils.getAllFromDb("SELECT * FROM tickets WHERE 'updatedAt' > ${date}", 'ticket')
                  .then(updatedDocs => {
                    var allDocs = newDocs ? newDocs.concat(updatedDocs) : updatedDocs;
                    if (allDocs) {
                      console.log('SOFTUPDATE ALLDOCS TICKET: ', docs);

                      utils.bulkAdd(allDocs, 'ticket')
                    };
                  })
                })
              } else {
                resolve('updated');
              }
            }))
  .catch(err => {
    softUpdate.stop();
    console.log('Error creating cron task: ', new Date(), err);
  })
},true,'America/San_Francisco')

module.exports = softUpdate;
