const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: {
    level: 'trace',
  },
});

module.exports = client;

