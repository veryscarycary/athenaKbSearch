'use strict'
const mw = require('../config/middleware');
const request = mw.request;
const url = mw.urls.database;
const utils = require('./utils');

module.exports = {
  pingEs: (req, res) => {
    utils.ping();
  },

  addIndex: (req, res) => {
    mw.mongodb.MongoClient.connect(mw.urls.masterDatabase, (err, db) => {
      if (err) { res.status(503).send(err); }
      db.collection('kbs').find().toArray((err, docs) => {
        if (err) { res.status(404).send(err); }
        utils.bulkAdd(docs)
          .then(resp => {
            res.status(200).send(resp);
          })
          .catch(err => {
            console.log('error!!');
            res.status(503).send(err);
          })
      })
    })
  },

  findMostRecent: (req, res) => {
    var date = utils.getLatestDate().then((err, resp) => {
      if (err) { res.status(404).send(err) }
      res.status(200).send(resp);
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
  }
}
