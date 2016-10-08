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
        utils.bulkAdd(docs).then((err, resp) => {
          if (err) { res.status(404).send(err) }
          res.status(200).send('successfully indexed the new articles');
        })
      })
    })
  },

  findMostRecent: (req, res) => {
    var date = utils.getLatestDate().then((err, resp) => {
      if (err) { res.status(404).send(err) }
      res.status(200).send(resp);
    })
  }
}
utils.getLatestDate();
