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
      return client.indices
        .create({
          index: 'kb',
        })
        .then(() => {
          console.log('KB indices created!');
          return client.indices
            .putMapping({
              index: 'kb',
              body: {
                // Removed the 'type' parameter
                properties: {
                  id: {
                    type: 'long',
                  },
                  issue: {
                    type: 'string',
                  },
                  issuePreview: {
                    type: 'string',
                  },
                  title: {
                    type: 'string',
                  },
                  solution: {
                    type: 'string',
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
            })
            .then(() => utils.getAllFromDb(null, 'kb'))
            .then((docs) => utils.bulkAdd(docs, 'kb'))
            .then(() => console.log('KB initialized successfully!'));
        });
    })
    .catch((err) => console.log('Error initializing KB, ', err));
};
