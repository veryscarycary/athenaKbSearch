const client = require('../../elasticsearch');
const utils = require('./utils');

module.exports = () => {
  client.indices
    .delete({
      index: 'kb',
      ignore_unavailable: true,
    })
    .then(() => {
      console.log('KB indices deleted!');
      return client.indices.create({ index: 'kb' });
    })
    .then(() => {
      console.log('KB indices created!');
      return client.indices.putMapping({
        index: 'kb',
        body: {
          properties: {
            id: {
              type: 'long',
            },
            issue: {
              type: 'text',
            },
            issuePreview: {
              type: 'text',
            },
            title: {
              type: 'text',
            },
            solution: {
              type: 'text',
            },
            updatedAt: {
              type: 'date',
              format: 'strict_date_optional_time||epoch_millis',
            },
            dateLastViewed: {
              type: 'date',
              format: 'strict_date_optional_time||epoch_millis',
            },
            createdAt: {
              type: 'date',
              format: 'strict_date_optional_time||epoch_millis',
            },
            archived: {
              type: 'boolean',
            },
            viewCount: {
              type: 'long',
            },
          },
        },
      }).catch(err => {
        throw new Error(`Error updating mapping: ${err.message}`);
      });
    })
    .then(() => {
      console.log('Mapping updated successfully!');
      return utils.getAllFromDb(null, 'kb');
    })
    .then((docs) => {
      console.log(`${docs.length} documents fetched from the database.`);
      return utils.bulkAdd(docs, 'kb');
    })
    .then(() => {
      console.log('KB initialized successfully!');
    })
    .catch((err) => {
      console.error('Error initializing KB:');
      console.error(`Context: ${err.message}`);
      console.error(`Status Code: ${err.statusCode || 'N/A'}`);
      console.error('Error Message:', err.message);
      if (err.meta && err.meta.body) {
        console.error('Error Response Body:', JSON.stringify(err.meta.body, null, 2));
      }
      if (err.meta && err.meta.request) {
        console.error('Request Object:', JSON.stringify(err.meta.request, null, 2));
      }
    });
};
