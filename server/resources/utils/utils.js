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
    return client.indices.getMapping({
      index: index,
    });
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
    // SEARCH OBJECT
    // {
    //  options: {
    //    archived: bool, // required
    //    term: str, // required
    //    product: product,
    //    ticket: ticketID,
    //    range: {
    //      startDate: ISOstr,
    //      endDate: ISOstr
    //    }
    //  }
    // }
    //
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

    return client.search({
        _index: 'kb',
        body: {
          fields: [
            '_source',
          ],
          query: {
            function_score: {
              query: {
                bool: {
                  filter: {
                    term: {archived: options.archived}
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
                    field: 'dateSubmitted',
                    modifier: 'log1p',
                  }
                },
                {
                  field_value_factor: {
                    field: 'lastEdited',
                    modifier: 'log1p',
                  }
                }
              ]
            }
          }
        }
    })
  }
};

  const formatArticlesForBulkAdd = arr => {
    return Promise.all(arr.map((item, i) => {
      return checkExists(item.id)
      .then(resp => {
        var doc, header, action;
        action = resp.exists ? 'update' : 'index';
        doc = {};
        doc.id = item.id;
        doc.issuePreview= item.issuePreview;
        doc.title=item.title;
        doc.issue= item.issue;
        doc.solution= item.solution;
        doc.lastEdited= new Date(item.datesEdited[item.datesEdited.length-1][0]);
        doc.dateSubmitted= new Date(item.dateSubmitted);
        doc.viewCount= item.viewCount;
        doc.archived= item.archived;
        doc.relatedProducts= item.relatedProducts[0];
        doc.dateLastViewed= new Date(item.dateLastViewed);
        doc.tickets= item.relatedTickets;
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

