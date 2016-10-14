const client = require('../../elasticsearch');
const utils = require('./utils');

module.exports = () => {
  console.log('Begin initializing ticket');
  client.indices.delete({
    index: 'ticket',
    ignore:404,
  })
  .then(() => {
    console.log('Ticket indices deleted!')
    return client.indices.create({
      index: 'ticket',
    })
    .then(() => {
      console.log('Ticket indices created!')
      return client.indices.putMapping({
        index: 'ticket',
        type: 'ticket',
        body: {
          properties: {
            id: {
              type: 'string'
            },
            issue: {
              type: 'string',
            },
            solution: {
              type: 'string',
            },
            product: {
              type: 'string',
            },
            resolved: {
              type: 'boolean',
            },
            customerId: {
              type: 'string',
            },
            relatedArticles: {
              type: 'string'
            },
            createdAt: {
              type: 'date',
              format: 'strict_date_optional_time||epoch_millis',
            },
            updatedAt: {
              type: 'date',
              format: 'strict_date_optional_time||epoch_millis',
            },
          }
        }
      })
      .then(() => utils.getAllFromDb(null, 'ticket'))
        .then(docs => utils.bulkAdd(docs, 'ticket'))
          .then(() => console.log('Ticket initialized successfully!'))
    })
  })
  .catch(err => console.log('error initializing ticket, ', err));
};
