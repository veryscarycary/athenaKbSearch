const utils = require('/server/resources/utils/utils');
const client = require('/server/elasticsearch');
const mw = require('/server/config/middleware');


var refreshListings = () => {
  console.log('cron task activated');
  utils.clearAllDocuments()
    .then(() => {
      getAllFromDb()
        .then((docs) => {
          utils.bulkAdd(docs)
        })
    })
    .catch(err => {
      console.log(err);
    })
}
refreshListings();
