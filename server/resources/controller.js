const mw = require('../config/middleware.js');
const request = mw.request;
const db = require('./db.js').db;
const url = mw.urls.databaseDefault;
const Sequelize = mw.sequelize;

module.exports = {
  pingDb (req, res) {
    let start = Date.now();
    db.authenticate()
      .then(() => //res.status(200).send(),
        console.log(arguments))
      .catch(err => res.status(503).send(err))
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
