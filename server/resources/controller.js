'use strict'
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
    var options = req.body.options;
    console.log(options);
    utils.basicSearch(options)
      .then(result => {
        req.send(200).send(resp);
      })
      .catch(err => {
        res.status(404).send(err);
      })
  }
}
