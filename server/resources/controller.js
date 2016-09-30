'use strict'
const mw = require('../config/middleware.js');
const request = mw.request;
const url = mw.urls.database;
const client = require('../elasticsearch.js');

module.exports = {
  pingEs: (req, res) => {
    client.ping({
      requestTimeout: 3000,
    }, err => err ?
      console.error('elasticsearch server stopped: ', err)
        : console.log('elasticsearch client listening at 9200'))
  },
  addIndex: (req, res) => {
    mw.mongodb.MongoClient.connect(mw.urls.masterDatabase, (err, db) => {
      if (err) { res.status(503).send(err); }
      db.collection('kbs').find().toArray((err, docs) => {
        console.log(docs);
        if (err) { res.status(404).send(err); }
        client.bulk({body: indexArticles(docs)}, (err) => {
          if (err) { res.status(404).send(err); }
          res.status(200).send('successfully indexed the articles');
        })
      })
    })
  },
  searchTerm: (req, res) => {
    client.search({
      index: 'kb',
//      type: 'articles',
//      field: ['issue', 'issuePreview', 'solution'],
      q: 'adipisicing',
//      must: [{
        dateLastViewed: {
          gte: "2015-04-23T04:53:40.000Z"
        }
//      }]
    }, (err, resp) => {
      if (err) {console.log('error searching')}
      res.status(200).send(resp);
    })
  }
}

var indexArticles = (arr) => {
  var bulkEdits = [];
  arr.map((item, i) => {
    if (i < 10) {
      var doc = {
        issuePreview: item.issuePreview,
        issue: item.issue,
        solution: item.solution,
        lastEdited: new Date(item.datesEdited[item.datesEdited.length-1][0]),
        dateSubmitted: new Date(item.dateSubmitted),
        viewCount: item.viewCount,
        archived: item.archived,
        relatedProducts: item.relatedProducts[0],
        dateLastViewed: new Date(item.dateLastViewed)
      }
      var header = {index: {_index:'kb', _type:'article'}};
      bulkEdits.push(header, doc);
    }
  });
  return bulkEdits;
}


var countAllDocuments = () => {
  client.count((err, response, status) => {
    if (err) { console.log(err) }
    console.log('there are ', response.count, ' shards in this cluster.');
  })
}

var clearAllDocuments = () => {
  client.indices.delete({
    index: '*',
  }, (err, resp) => err ?
    console.log('error deleting indices, ', err)
    : console.log('deleted all instances of from elasticsearch'))
}

var getMappingOfIndex = (index) => {
  client.indices.getMapping({
    index: index,
  }, (err, resp) => err ?
    console.log('error getting mapping of indices, ', err)
    : console.log('mapping of documents in ', index, ' : ', resp));
}

//clearAllDocuments();
//getMappingOfIndex('kb');
