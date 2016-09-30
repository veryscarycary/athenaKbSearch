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
    arr = formatArticlesForBulkAdd(arr);
    return client.bulk({body: arr});
    // returns promise
  },

  // Return current number of documents in cluster
  countAllDocuments: () => {
    client.count((err, response, status) => {
      if (err) { console.log(err) }
      console.log('there are ', response.count, ' shards in this cluster.');
    })
  },

  // Delete all documents in kb index
  clearAllDocuments: () => {
    client.indices.delete({
      _index: 'kb',
    }, (err, resp) => err ?
      console.log('error deleting indices, ', err)
        : console.log('deleted all instances of from elasticsearch'))
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
        console.log(date);
        resolve(date);
      })
    })
  },
}

const formatArticlesForBulkAdd = (arr) => {
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
