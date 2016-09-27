'use strict'
const mw = require('../config/middleware.js');
const request = mw.request;
const url = mw.urls.database;
const KbStub = require('./schema.js');

module.exports = {
  pingDb (req, res) {
    require('../db/index.js').readyState ? 
      res.status(200).send(JSON.stringify('db connected'))
      : res.status(503).send(JSON.stringify({name: 'MONGO_CONN_FAIL', message: 'bad MongoDB connection'}
      ));
  },
  getStubs(req, res) {
    let id = req.params.id;
    KbStub.find(id ? {_id: req.params.id} : {}, 
      (err, data) => err ? 
        res.status(404).send(err)
        : res.status(200).send(JSON.stringify(data))
    );
  }, 
  updateFromMaster(req, res) {
    mw.mongodb.MongoClient.connect(mw.urls.masterDatabase, (err, db) => err ? 
      res.status(503).send(err)
      : db.collection('kbs').find().toArray((err, kbs) => err ? 
        res.status(404).send(err) 
        : KbStub.remove({}, err => err ? 
          res.status(500).send(err)
          : (() => {
            let doneCount = 0, length = kbs.length, errors = [];
            while(kbs.length > 0) {
              let entry = kbs.pop();
              new KbStub({
                _id: entry._id,
                title: entry.title,
                issuePreview: entry.issuePreview,
                relatedProducts: entry.relatedPorducts,
                authorId: entry.authorId,
                archived: entry.archived,
                datesEdited: entry.datesEdited,
                dateSubmitted: entry.dateSubmitted,
                dateLastViewed: entry.dateLastViewed,
                viewCount: entry.viewCount
              })
              .save(err => err ? 
                doneCount++ && errors.push(err)
                : ++doneCount === length &&
                  res.status(200).send(JSON.stringify(
                    `${doneCount - errors.length} complete. ${errors.length} errors: ${errors}`
                  ))
              );
            }
          })()
          )
        )
    );
  }, 
  refreshFromMaster(req, res) {

  }
};
