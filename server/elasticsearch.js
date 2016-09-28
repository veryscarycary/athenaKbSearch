const elasticsearch = require('elasticsearch');

module.exports = {
  client: new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
  })
};
