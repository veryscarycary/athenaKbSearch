const mw = require('../config/middleware');
const request = mw.request;
const utils = require('./utils/utils');

module.exports = {
  pingEs: (req, res) => {
    utils.ping();
  },

  searchAll: (req, res) => {
    utils.searchAll(req.query.type)
      .then(docs => {
        res.status(200).send(docs)
      })
      .catch(err => {
        res.status(404).send(err);
      })
  },

  testPostgres: (req, res) => {
    utils.testPostgres()
      .then(docs => {
        res.status(200).send(docs)
      })
      .catch(err => {
        res.status(404).send(err);
      })
  },

  getAllRecords: (req,res) => {
    utils.getAllRecords(req.params.type)
      .then(docs => {
        res.status(200).send(docs)
      })
      .catch(err => {
        res.status(404).send(err);
      })
  },

  addIndex: (req, res) => {
    var type = req.query.type
    utils.getAllFromDb(null, type)
      .then(docs => {
        console.log('I AM DOCS', docs);
        utils.bulkAdd(docs, type)
          .then(resp => {
            console.log('resp',resp);
            res.status(200).send(resp);
          })
          .catch(err => {
            console.log(err);
            res.status(503).send(err);
          })
      })
  },
  checkIndexExists: (req, res) => {
    utils.checkIndexExists(req.query.type)
      .then(resp => {
        res.status(200).send(resp);
      })
      .catch(err => {
        console.log('error', err);
        res.status(503).send('error');
      })
  },

  findMostRecent: (req, res) => {
    var date = utils.getLatestDate(req.query.type)
      .then(resp => {
        res.status(200).send(resp);
      })
      .catch(err => {
        if (err) { res.status(404).send(err) }
      })
  },

  mapping: (req, res) => {
    utils.getMappingOfIndex(req.query.type)
      .then(resp => {
        res.status(200).send(resp)
      })
      .catch(err => {
        res.status(404).send(err);
      })
  },

  deleteAllRecords: (req, res) => {
    utils.clearAllDocuments(req.query.type)
      .then(resp => {
        res.status(200).send('all documents successfully deleted');
      })
      .catch(err => {
        res.status(503).send(err);
      });
  },
  count: (req, res) => {
    utils.countAllDocuments(req.query.type)
      .then(resp => {
        res.status(200).send(resp);
      })
      .catch(err => {
        res.status(404).send(err);
      });
  },
  search: (req, res) => {
    var options = {
      type: req.query.type,
      term: req.query.term,
      archived: req.query.archived,
      product: req.query.product,
      dateStart: req.query.dateStart,
      dateEnd: req.query.dateEnd,
      tickedId: req.query.ticketId,
    }
    console.log('THis is the term: ', req.query.term);
    console.log('these are the options: ', options);
    utils.basicSearch(options)
      .then(result => {
        console.log(result)
        res.status(200).send(result.hits.hits);
      })
      .catch(err => {
        res.status(404).send(err);
      })
  }
}
