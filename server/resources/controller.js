'use strict'
const mw = require('../config/middleware.js');
const request = mw.request;
const url = mw.urls.database;

module.exports = {
  pingDb (req, res) {
    require('../db/index.js').readyState ? 
      res.status(200).send(JSON.stringify('db connected'))
      : res.status(503).send(JSON.stringify({name: 'MONGO_CONN_FAIL', message: 'bad MongoDB connection'}
      ));
  },
  getStub(req, res) {
    res.status(200).send(req.params.username);
    // request(`${url}/${req.params.username}`, (err, res, body) => err ?
    //   res.status(404).send(err)
    //   : res.status(200).send(res)
    // );
  }, 
  getArticle(req, res) {

  },
  createArticle(req, res) {

  }
};
