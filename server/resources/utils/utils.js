const client = require('../../elasticsearch');
const mw = require('../../config/middleware');
const kbDb = require('../../config/urls').kb.database;
const ticketDb = require('../../config/urls').ticket.database;
const Sequelize = require('sequelize');
const kbSequelize = new Sequelize(kbDb);
const ticketSequelize = new Sequelize(ticketDb);


module.exports = {
  ping: () => {
    client.ping({}, { requestTimeout: 3000 }, (err) => {
      if (err) {
        console.error('Elasticsearch server stopped: ', err);
      } else {
        console.log('Elasticsearch client listening at 9200');
      }
    });
  },

  testPostgres: () => {
    return ticketSequelize.query("SELECT * FROM tickets WHERE 'createdAt' > '2016-01-01'");
    // return kbSequelize.query("SELECT * FROM articles WHERE 'createdAt' > '2016-01-01'");
  },

  bulkAdd: (arr, type) => {
    return formatArticlesForBulkAdd(arr, type)
      .then((bulk) => {
        console.log('BULK AFTER FORMATTING: ' + JSON.stringify(bulk));
        return client.bulk({ body: bulk }).catch((err) => console.log('BULK ERROR: '+ err));
      });
  },

  searchAll: (type) => {
    console.log();
    return client.search({
      index: type,
      body: {
        query: {
          match_all: {},
        },
      },
    }).catch((err) => console.log(`searchAll Error: ${err}`));
  },

  countAllDocuments: (type) => {
    return client.count({
      index: type || '*',
    });
  },

  clearAllDocuments: (type) => {
    return client.indices.delete({
      index: type || '*',
    });
  },

  getMappingOfIndex: (type) => {
    return client.indices.getMapping({
      index: type || 'all',
    });
  },

  getLatestDate: (type) => {
    let date;

    return new Promise((resolve, reject) => {
      client.search({
        index: type,
        ignore: [404],
        body: {
          sort: [
            { updatedAt: { order: 'desc' } },
          ],
          size: 1, // Add size to limit results
        },
      })
      .then((res) => {
        date = res.body.hits.hits.length > 0 ? res.body.hits.hits[0]._source.updatedAt : false;
        return client.search({
          index: type,
          ignore: [404],
          body: {
            sort: [
              { createdAt: { order: 'desc' } },
            ],
            size: 1, // Add size to limit results
          },
        });
      })
      .then((res) => {
        const compare = res.body.hits.hits.length > 0 ? res.body.hits.hits[0]._source.updatedAt : false;
        if (date && compare) {
          date = date > compare ? date : compare;
        } else {
          reject(false);
          return;
        }
        resolve(date);
      })
      .catch(reject);
    });
  },

  getAllRecords: (type) => {
    return client.search({
      index: type,
      size: 10,
      body: {
        query: {
          match_all: {},
        },
      },
    }).catch((err) => console.log(`getAllRecords Error: ${err}`));
  },

  getAllFromDb: (query, type) => {
    if (type === 'kb') {
      return new Promise((resolve, reject) => {
        const queryString = query ? query : 'SELECT * from articles';
        return kbSequelize.query(queryString, { type: Sequelize.QueryTypes.SELECT })
          .then((docs) => resolve(Array.prototype.slice.call(docs)))
          .catch((err) => reject(err));
      });
    } else {
      return new Promise((resolve, reject) => {
        const queryString = query ? query : 'SELECT * from tickets';
        return ticketSequelize.query(queryString, { type: Sequelize.QueryTypes.SELECT })
          .then((docs) => resolve(Array.prototype.slice.call(docs)))
          .catch((err) => reject(err));
      });
    }
  },

  basicSearch: (options) => {
    const must = [];
    if (options.product) {
      must.push({ term: { relatedProducts: options.product } });
    }
    if (options.ticket) {
      must.push({ term: { tickets: options.ticketId } });
    }
    if (options.range) {
      must.push({
        range: {
          createdAt: {
            gte: options.startDate || '',
            lte: options.endDate || new Date(),
          },
        },
      });
    }

    const searchBody = {
      query: {
        bool: {
          filter: {
            term: { archived: options.archived || false },
          },
          should: [
            {
              multi_match: {
                query: options.term,
                fields: ['title^3', 'issuePreview^3', 'issue', 'solution'],
              },
            },
          ],
        },
      },
    };

    return client.search({
      index: options.type === 'kb' ? 'kb' : 'ticket',
      body: searchBody,
    }).catch((err) => console.log(`basicSearch Error: ${err}`));
  },
};

const formatArticlesForBulkAdd = (arr, type) => {
  const docs = arr;
  return Promise.all(docs.map((item) => {
    return checkDocExists(item.id, type)
      .then((resp) => {
        console.log('DOCEXISTS RESP: ' + JSON.stringify(resp));
        let doc, header, action;
        action = resp ? 'update' : 'index';
        doc = {
          id: item.id,
          issue: item.issue,
        };

        if (type === 'kb') {
          doc.issuePreview = item.issuePreview;
          doc.title = item.title;
          doc.solution = item.solution;
          doc.updatedAt = new Date(item.updatedAt);
          doc.createdAt = new Date(item.createdAt);
          doc.viewCount = item.viewCount;
          doc.archived = item.archived;
          doc.dateLastViewed = new Date(item.dateLastViewed);
        } else if (type === 'ticket') {
          doc.product = item.product;
          doc.customerId = item.customerId;
          doc.status = item.status;
          doc.solution = item.solution;
          doc.title = item.title;
          doc.createdAt = new Date(item.createdAt);
          doc.updatedAt = new Date(item.updatedAt);
          doc.issuePreview = item.issuePreview;
        }
        header = { [action]: { _index: type, _id: item.id } };
        return [header, { doc }];
      });
  }))
  .then((arr) => {
    const bulkAdds = arr.reduce((acc, item) => acc.concat(item), []);
    return bulkAdds;
  });
};

const checkDocExists = (id, type) => {
  return client.exists({
    index: type,
    id: id,
  }).catch((err) => {
    console.log('EXISTS error: ' + JSON.stringify(err));
  });
};
