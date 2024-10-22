const client = require('../../elasticsearch');
const utils = require('./utils');

module.exports = () => {
  console.log('Begin initializing ticket');

  // Delete the existing index if it exists
  client.indices
    .delete({
      index: 'ticket',
      ignore_unavailable: true,
    })
    .then(() => {
      console.log('Ticket indices deleted!');

      // Create a new index
      return client.indices.create({
        index: 'ticket',
      });
    })
    .then(() => {
      console.log('Ticket indices created!');

      // Define the mapping for the new index
      return client.indices.putMapping({
        index: 'ticket',
        body: {
          properties: {
            id: {
              type: 'text', // Consider using 'keyword' if this is for filtering/searching
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
      console.log('Mapping updated successfully!');

      // Fetch documents from the database
      return utils.getAllFromDb(null, 'ticket');
    })
    .then((docs) => {
      console.log(`${docs.length} Ticket documents fetched from the database.`);

      // Bulk add documents to the new index
      return utils.bulkAdd(docs, 'ticket');
    })
    .then((resp) => {
      console.log('bulkAdd Response: ' + JSON.stringify(resp));
      console.log('Ticket initialized successfully!');
    })
    .catch((err) => {
      // Enhanced error handling with detailed logging
      console.error('Error initializing ticket:');
      console.error(`Status Code: ${err.statusCode || 'N/A'}`);
      if (err.meta && err.meta.body) {
        console.error('Error Response Body:', JSON.stringify(err.meta.body, null, 2));
      } else {
        console.error('Error Message:', err.message);
      }
    });
};
