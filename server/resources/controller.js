const mw = require('../config/middleware');
const request = mw.request;
const url = mw.urls.database;
const utils = require('./utils/utils');

module.exports = {
  pingEs: (req, res) => {
    utils.ping();
  },

  addIndex: (req, res) => {
    utils.getAllFromDb()
      .then(docs => {
        utils.bulkAdd(docs)
          .then(resp => {
            res.status(200).send(resp);
          })
          .catch(err => {
            console.log('error!!');
            res.status(503).send(err);
          })
      })
  },

  findMostRecent: (req, res) => {
    var date = utils.getLatestDate()
      .then(resp => {
        res.status(200).send(resp);
      })
      .catch(err => {
        if (err) { res.status(404).send(err) }
      })
  },

  mapping: (req, res) => {
    utils.getMappingOfIndex('kb')
      .then(resp => {
        res.status(200).send(resp)
      })
      .catch(err => {
        res.status(404).send(err);
      })
  },

  deleteAllRecords: (req, res) => {
    utils.clearAllDocuments()
      .then(resp => {
        res.status(200).send('all documents successfully deleted');
      })
      .catch(err => {
        res.status(503).send(err);
      });
  },
  count: (req, res) => {
    utils.countAllDocuments()
      .then(resp => {
        res.status(200).send(resp);
      })
      .catch(err => {
        res.status(404).send(err);
      });
  },
  search: (req, res) => {
    console.log('HERE IS THE QUERY',req.query);
    var options = {
      term: req.query.term,
      archived: req.query.archived,
      product: req.query.product,
      dateStart: req.query.dateStart,
      dateEnd: req.query.dateEnd,
      tickedId: req.query.ticketId,
    }
    utils.basicSearch(options)
      .then(result => {
        res.status(200).send(result.hits.hits);
      })
      .catch(err => {
        res.status(404).send(err);
      })
  }
}
