const client = require('../../elasticsearch');
const mw = require('../../config/middleware');
const kbDb = require('../../config/urls').kb.database;
const ticketDb = require('../../config/urls').ticket.database;
const Sequelize = require('sequelize');
const kbSequelize = new Sequelize(kbDb);
const ticketSequelize = new Sequelize(ticketDb);


module.exports = {
  ping: () => {
    client.ping({
      requestTimeout: 3000,
    }, err => err
      ? console.error('elasticsearch server stopped: ', err)
      : console.log('elasticsearch client listening at 9200'))
  },

  testPostgres: () => {
    return ticketSequelize.query("SELECT * FROM tickets WHERE 'createdAt' > '2016-01-01'");
    //return kbSequelize.query("SELECT * FROM articles WHERE 'createdAt' > '2016-01-01'");
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
        ignore:404,
        body: {
          sort: [
            { updatedAt: {order: "desc"} },
          ]
        }
      }, (err, res) => {
        if (err) { reject(err) };
        date = res.hits ? res.hits.hits[0]._source.updatedAt : false;
        if (date === null) {
          return(false);
        }
      })
      client.search({
        _index: type,
        ignore:404,
        body: {
          sort: [
            { createdAt: {order: "desc"} },
          ]
        }
      }, (err, res) => {
        if (err) { reject(err) };
        var compare = res.hits ? res.hits.hits[0]._source.updatedAt : false;
        if (date && compare) {
          date = date > compare ? date : compare;
        } else {
          reject(false);
        }
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
        if (!query) {
          return ticketSequelize.query('SELECT * from tickets')
          .then(docs => resolve(docs[0]));
        } else {
          return ticketSequelize.query(query, {type: sequelize.QueryTypes.select})
          .then(docs => resolve(docs[0]));
        }
      })
      .catch(err => reject(err));
    }
  },

  //searchProductByDate: (options) => {
    //// options: type='*' || 'ticket' || 'kb'
    ////          product: product
    ////          startDate: date
    ////          endDate: date

    //return client.search({
      //index: options.index,
      //body: {
        //fields: [
          //'_source',
        //],
        //query: {
          //bool: {
            //must: [
              //{term: {products: options.product}}
            //],
            //range: {
              //dateSubmitted: {
                //gte: options.startDate,
                //lte: options.endDate || new Date(),
              //}
            //}
          //}
        //}
      //}
    //})
  //},

  basicSearch: (options) => {
    var product = {
      term: {relatedProducts: options.product},
    };
    var ticket = {
      term: {tickets: options.ticketId},
    };
    var range = {
      createdAt: {
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
          query: {
            function_score: {
              query: {
                bool: {
                  should: [
                    {
                      multi_match: {
                        query: options.term,
                        fields: ['issue^3', 'solution', 'issuePreview', 'product^3'],
                      }
                    },
                    {
                      multi_match: {
                        query: 'unresolved',
                        fields: ['status']
                      }
                    }
                  ],
                }
              },
              functions: [
                {
                  field_value_factor:
                    {
                      field: 'createdAt',
                      modifier: 'log1p',
                    }
                },
                {
                  field_value_factor:
                    {
                      field: 'updatedAt',
                      modifier: 'log1p',
                    }
                }
              ]
            }
          }
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
        doc.status = item.status;
        doc.solution = item.solution;
        doc.title = item.title;
        doc.createdAt = new Date(item.createdAt);
        doc.updatedAt = new Date(item.updatedAt);
        doc.issuePreview = item.issuePreview;
        doc.solution = item.solution || '';
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

