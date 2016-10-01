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
    return formatArticlesForBulkAdd(arr)
      .then(bulk => {
        console.log(bulk);
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

  basicSearch: (options) => {
    var primaryTermSearch = {
      multi_match: {
        query: options.term,
        fields: ['title', 'issuePreview'],
        boost: 3
      }
    }
    var secondaryTermSearch = {
      mutli_match: {
        query: options.term,
        fields: ['issue', 'solution']
      }
    }
    var archived = {archived: false};
    var should = [primaryTermSearch];
    if (!options.archived) {
      should.push(archived);
    }

    return client.search({
      _index: 'kb',
      body: {
        query: {
          function_score: {
            query: {
              bool: {
                should: should
              },
              field_value_factor: {
                fields: ['viewCount', 'lastEdited', 'dateLastViewed'],
                modifier: 'log1p'
              },
              size: 10,
            }
          }
        }
      }
    })
  }
}

const formatArticlesForBulkAdd = arr => {
  return Promise.all(arr.map((item, i) => {
      return checkExists(item.id)
        .then(resp => {
          var doc, header, action;
          action = resp.exists ? 'update' : 'index';
          doc = {};
          doc.id = item.id,
          doc.issuePreview= item.issuePreview,
          doc.issue= item.issue,
          doc.solution= item.solution,
          doc.lastEdited= new Date(item.datesEdited[item.datesEdited.length-1][0]),
          doc.dateSubmitted= new Date(item.dateSubmitted),
          doc.viewCount= item.viewCount,
          doc.archived= item.archived,
          doc.relatedProducts= item.relatedProducts[0],
          doc.dateLastViewed= new Date(item.dateLastViewed)
          if (resp.exists) {
            doc = {doc: doc};
          }
          header = {[action]: { _index: 'kb', _type: 'article', _id: item.id }};
          return [header, doc];
        })
  }))
    .then(arr => {
      return new Promise((resolve, reject) => {
        var bulkAdds = []
        arr.map(item => {
          bulkAdds.push(item[0], item[1]);
        })
        resolve(bulkAdds);
      })
    })
};

const checkExists = (id) => {
  return client.searchExists({
    _index: 'kb',
    ignore: 404,
    ignoreUnavailable: true,
    q: id
  })
};
