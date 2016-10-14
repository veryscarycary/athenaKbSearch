const client = require('../../elasticsearch');
const mw = require('../../config/middleware');
const kbDb = require('../../config/urls').kb.database;
const Sequelize = require('sequelize');
const kbSequelize = new Sequelize(kbDb);
const ticketDb = require('../../config/urls').ticket.masterDatabase;


module.exports = {
  ping: () => {
    client.ping({
      requestTimeout: 3000,
    }, err => err
      ? console.error('elasticsearch server stopped: ', err)
      : console.log('elasticsearch client listening at 9200'))
  },

  testPostgres: () => {
    return kbSequelize.query('SELECT * from articles', {type: Sequelize.QueryTypes.select})
  },

  bulkAdd: (arr, type) => {
    return formatArticlesForBulkAdd(arr, type)
    .then(bulk => {
      return client.bulk({body: bulk});
    })
  },

  searchAll: (type) => {
    console.log(type);
    return client.search({
      index: type,
      query: {
        match_all: {index: type},
      }
    })
  },

  countAllDocuments: (type) => {
    return client.count({
      index: type || '*',
    });
  },

  clearAllDocuments: (type) => {
    return client.indices.delete({
      index: type || '*',
    })
  },

  getMappingOfIndex: (type) => {
    return client.indices.getMapping({
      index: type || 'all',
    });
  },

  getLatestDate: (type) => {
    var date;
    return new Promise((resolve, reject) => {
      client.search({
        _index: type,
        body: {
          sort: [
            { lastEdited: {order: "desc"} },
          ]
        }
      }, (err, res) => {
        if (err) { reject(err) };
        console.log(res);
        date = res.hits.hits[0]._source.updatedAt;
      })
      client.search({
        _index: type,
        body: {
          sort: [
            { dateSubmitted: {order: "desc"} },
          ]
        }
      }, (err, res) => {
        if (err) { reject(err) };
        var compare = res.hits.hits[0]._source.createdAt;
        date = date > compare ? date : compare;
        resolve(date);
      })
    })
  },

  getAllRecords: (type) => {
    return client.search({
      index: type,
//      type: 'article',
      size: 10,
      body: {
        query: {
          match_all: {},
        }
      }
    })
  },

  getAllFromDb: (query, type) => {
    if (type === 'kb') {
      return new Promise((resolve, reject) => {
        if (!query) {
          console.log('I\'m in, query: ', query, ' type:  ', type);
          return kbSequelize.query('SELECT * from articles')
            .then(docs => resolve(docs));
        } else {
          return kbSequelize.query(query, {type: sequelize.QueryTypes.select})
            .then(docs => resolve(docs));
        }
      })
      .catch(err => reject(err));
    } else {
     return new Promise((resolve, reject) => {
      mw.mongodb.MongoClient.connect(mw.urls[type].masterDatabase, (err, db) => {
        if (err) { reject(err); }
        var collection = 'tickets';
        if (!query) {
          db.collection(collection).find().toArray((err, docs) => {
            if (err) { reject(err); }
            resolve(docs);
          })
        } else {
          db.collection(collection).find(query).toArray((err, docs) => {
            if (err) { reject(err); }
            resolve(docs);
          })
        }
      })
    });
  }
},

  basicSearch: (options) => {
    var product = {
      term: {relatedProducts: options.product},
    };
    var ticket = {
      term: {tickets: options.ticketId},
    };
    var range = {
      dateSubmitted: {
        gte: options.startDate ? options.startDate : "",
        lte: options.endDate ? options.endDate : new Date(),
      }
    };

    var must = [];
    if (options.product) {
      must.push(product);
    }
    if (options.ticket) {
      must.push(ticket);
    }
    if (options.range) {
      must.push(range);
    }
    if (options.type === 'kb') {
      return client.search({
        index: 'kb',
        type: 'article',
        body: {
          fields: [
            '_source',
          ],
          query: {
            function_score: {
              query: {
                bool: {
                  filter: {
                    term: {archived: options.archived ? options.archived : false}
                  },
                  should: [
                    {
                      multi_match: {
                        query: options.term,
                        fields: ['title^3','issuePreview^3', 'issue', 'solution'],
                      }
                    }
                  ],
                }
              },
              functions: [
                {
                  field_value_factor: {
                    field: 'viewCount',
                    modifier: 'log1p',
                    factor: 3,
                  }
                },
                {
                  field_value_factor: {
                    field: 'createdAt',
                    modifier: 'log1p',
                  }
                },
                {
                  field_value_factor: {
                    field: 'updatedAt',
                    modifier: 'log1p',
                  }
                }
              ]
            }
          }
        }
      })
    } else {
      return client.search({
        index: 'ticket',
        type: 'ticket',
        body: {
          fields: [
            '_source',
          ],
//          query: {
//            function_score: {
              query: {
                bool: {
                  should: [
                    {
                      multi_match: {
                        query: options.term,
                        fields: ['issue^3', 'solution', 'product^3'],
                      }
                    }
                  ],
                }
              },
//              functions: [
                //{
                  //field_value_factor: {
                    //field: 'viewCount',
                    //modifier: 'log1p',
                    //factor: 3,
                  //}
                //},
//                {
//                  field_value_factor: {
//                    field: 'dateSubmitted',
//                    modifier: 'log1p',
//                  }
//                },
//                {
//                  field_value_factor: {
//                    field: 'lastEdited',
//                    modifier: 'log1p',
//                  }
//                }
//              ]
//            }
//          }
        }
      })
    }
  },
};

const formatArticlesForBulkAdd = (arr, type) => {
  var docs = type === 'kb' ? arr[0] : arr;
  return Promise.all(docs.map((item, i) => {
    return checkDocExists(item.id, type)
    .then(resp => {
      var doc, header, action;
      action = resp.exists ? 'update' : 'index';
      doc = {};
      doc.id= item.id;
      doc.issue= item.issue;
      if (type === 'kb') {
        doc.issuePreview= item.issuePreview;
        doc.title=item.title;
        doc.solution= item.solution;
        doc.updatedAt= new Date(item.updatedAt);
        doc.createdAt= new Date(item.createdAt);
        doc.viewCount= item.viewCount;
        doc.archived= item.archived;
        doc.dateLastViewed= new Date(item.dateLastViewed);
      } else if (type === 'ticket') {
        doc.product = item.product;
        doc.customerId = item.customerId;
        doc.resolved = item.resolved;
        doc.relatedArticles = item.relatedArticles;
        doc.solution = item.solution || '';
//        doc.createdAt= item.createdAt ? new Date(item.createdAt) : new Date('March 18, 2016');
//        doc.updatedAt= item.updatedAt ? new Date(item.updatedAt) : new Date('March 18, 2016');
        //doc.dateSubmitted = new Date(item.dateSubmitted || 'March 18 2016');
        //doc.lastEdited = new Date(item.dateSubmitted || 'March 18 2016');
      }
      if (resp.exists) {
        doc = {doc: doc};
      }
      header = {[action]: { _index: type, _type: type === 'kb' ? 'article' : 'ticket' , _id: item.id }};
      return [header, doc];
    })
  }))
  .then(arr => {
    return new Promise((resolve, reject) => {
      var bulkAdds = []
      arr.map(item => {
        bulkAdds.push(item[0], item[1]);
      })
      console.log(bulkAdds);
      resolve(bulkAdds);
    })
  })
};

const checkDocExists = (id, type) => {
  return client.searchExists({
    index: type,
    ignore: 404,
    ignoreUnavailable: true,
    q: id
  })
};

