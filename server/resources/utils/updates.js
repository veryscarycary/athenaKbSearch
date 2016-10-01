var utils = require('./utils');
var client = require('../../elasticsearch');
var mw = require('../../config/middleware');

var shallowUpdate = () => {
  console.log('shalow update invoked at: ', new Date());
  var date = utils.getLatestDate()
    .then(date => {
      utils.getAllFromDb({
        dateSubmitted: {
          $gte: date,
        },
        lastEdited: {
          $get: date,
        }
      }, (err, docs) => {
        if (err) { console.error(err) };
          bulkAdd(docs)
            .then(resp => {
              console.log('Successfully updated the documents')
            })
      })
    })
    .catch(err => {
      console.log('There was an error updating the documents')
    })
  setTimeout(() => {shallowUpdate()}, 300000);
}

shallowUpdate();
