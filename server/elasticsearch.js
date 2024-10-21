const { Client } = require('@elastic/elasticsearch');
const HOST = process.env.DOCKER_COMPOSE ? 'elasticsearch' : 'localhost';
const PORT = 9200;

const client = new Client({
  node: `http://${HOST}:${PORT}`,
  log: {
    level: 'trace',
  },
});

module.exports = client;

