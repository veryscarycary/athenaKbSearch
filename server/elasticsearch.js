const elasticsearch = require('elasticsearch');
const HOST = process.env.DOCKER_COMPOSE ? 'elasticsearch' : 'localhost';
const PORT = 9200;

const client = new elasticsearch.Client({
  host: `${HOST}:${PORT}`,
  log: {
    level: 'trace',
  },
});

module.exports = client;

