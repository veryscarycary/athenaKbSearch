const client = require('../elasticsearch');

module.exports = {
  //Ping elasticsearch server
  ping: () => {
    client.ping({
      requestTimeout: 3000,
    }, err => err ?
      console.error('elasticsearch server stopped: ', err)
        : console.log('elasticsearch client listening at 9200'))
  },

  // Takes arr of docs from db and indexes them for ES
  bulkAdd: (arr) => {
    arr = formatArticlesForBulkAdd(arr)
    return client.bulk({body: arr});
  },

  // Return current number of documents in cluster
  countAllDocuments: () => {
    // Returns a promise
    return client.count();
  },

  // Delete all documents in kb index
  clearAllDocuments: () => {
    // Returns a promise
    return client.indices.delete({
      index: '*',
    })
  },

  // Check how elasticsearch is mapping your documents for analysis
  getMappingOfIndex: (index) => {
    client.indices.getMapping({
      index: index,
    }, (err, resp) => err ?
      console.log('error getting mapping of indices, ', err)
        : console.log('mapping of documents in ', index, ' : ', resp));
  },

  // Find the most recently indexed item, to inform recurring db query
  getLatestDate: () => {
    // search for most recent lastEdited
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
      // search for most recent dateSubmitted
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
}

const formatArticlesForBulkAdd = arr => {
  var bulkAdds = [];
  arr.map((item, i) => {
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
      bulkAdds.push(header, doc);
    }
  });
  console.log(bulkAdds);
  return bulkAdds;
};

const checkExists = (id) => {
  return client.searchExists({
    _index: 'kb',
    _id: id
  })
};
