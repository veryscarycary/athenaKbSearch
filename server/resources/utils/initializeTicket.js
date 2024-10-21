const client = require('../../elasticsearch');
const utils = require('./utils');

module.exports = () => {
  console.log('Begin initializing ticket');

  client.indices
    .delete({
      index: 'ticket',
      ignore_unavailable: true,
    })
    .then(() => {
      console.log('Ticket indices deleted!');
      return client.indices.create({
        index: 'ticket',
      });
    })
    .then(() => {
      console.log('Ticket indices created!');
      return client.indices.putMapping({
        index: 'ticket',
        body: {
          properties: {
            id: {
              type: 'text',
            },
            issue: {
              type: 'text',
            },
            solution: {
              type: 'text',
            },
            product: {
              type: 'text',
            },
            status: {
              type: 'text',
            },
            customerId: {
              type: 'text',
            },
            relatedArticles: {
              type: 'text',
            },
            createdAt: {
              type: 'date',
              format: 'strict_date_optional_time||epoch_millis',
            },
            updatedAt: {
              type: 'date',
              format: 'strict_date_optional_time||epoch_millis',
            },
          },
        },
      });
    })
    .then(() => {
      return utils.getAllFromDb(null, 'ticket');
    })
    .then((docs) => {
      return utils.bulkAdd(docs, 'ticket');
    })
    .then(() => {
      console.log('Ticket initialized successfully!');
    })
    .catch((err) => {
      console.log('Error initializing ticket, ', err);
    });
};
