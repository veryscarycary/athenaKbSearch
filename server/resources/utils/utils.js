const client = require('../../elasticsearch');
const mw = require('../../config/middleware');

module.exports = {
  ping: () => {
    client.ping({
      requestTimeout: 3000,
    }, err => err
      ? console.error('elasticsearch server stopped: ', err)
      : console.log('elasticsearch client listening at 9200'))
  },

  bulkAdd: (arr) => {
    formatArticlesForBulkAdd(arr)
      then(bulk => {
        return client.bulk({body: bulk});
      })
  },

  countAllDocuments: () => {
    return client.count();
  },

  clearAllDocuments: () => {
    return client.indices.delete({
      index: '*',
    })
  },

  getMappingOfIndex: (index) => {
    client.indices.getMapping({
      index: index,
    }, (err, resp) => err
      ? console.log('error getting mapping of indices, ', err)
      : console.log('mapping of documents in ', index, ' : ', resp));
  },

  getLatestDate: () => {
    var date;
    return new Promise((resolve, reject) => {
      client.search({
        _index: 'kb',
        body: {
          sort: [
            { lastEdited: {order: "desc"} },
          ]
        }
      }, (err, res) => {
        if (err) { reject(err) };
        date = res.hits.hits[0]._source.lastEdited;
      })
      client.search({
        _index: 'kb',
        body: {
          sort: [
            { dateSubmitted: {order: "desc"} },
          ]
        }
      }, (err, res) => {
        if (err) { reject(err) };
        var compare = res.hits.hits[0]._source.dateSubmitted;
        date = date > compare ? date : compare;
        resolve(date);
      })
    })
  },

  getAllFromDb: (options) => {
    return new Promise((resolve, reject) => {
      mw.mongodb.MongoClient.connect(mw.urls.masterDatabase, (err, db) => {
        if (err) { reject(err); }
        if (options) {
          db.collection('kbs').find().toArray((err, docs) => {
            if (err) { reject(err); }
            resolve(docs);
          })
        } else {
          db.collection('kbs').find(options).toArray((err, docs) => {
            if (err) { reject(err); }
            resolve(docs);
          })
        }
      })
    })
  },
}

const formatArticlesForBulkAdd = arr => {
  var bulkAdds = [];
  Promise.all(arr.map((item, i) => {
    return new Promise((resolve, reject) => {
      var doc, header;
      if (i < 3) {
        doc = {
          id: item.id,
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
        header = {index: { _index: 'kb', _type: 'article', _id: item.id }};
        resolve([header, doc]);
      }
    })
  }))
    .then(arr => {
      console.log('xxxx \n xxxx \n xxxx \n xxxx \n',arr);
    });
  return bulkAdds;
};

const checkExists = (id) => {
  return client.searchExists({
    _index: 'kb',
    _id: id
  })
};
