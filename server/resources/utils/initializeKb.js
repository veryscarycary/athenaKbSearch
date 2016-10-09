const client = require('../../elasticsearch');
const utils = require('./utils');

module.exports = () => {
  client.indices.delete({
    index: 'kb',
    ignore:404,
  })
  .then(()=> {
    console.log('KB indices deleted!')
    return client.indices.create({
      index: 'kb',
    })
    .then(() => {
      console.log("KB indices created!")
      return client.indices.putMapping({
        index: 'kb',
        type: 'article',
        body: {
          properties: {
            id: {
              type: 'string',
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
            lastEdited: {
              type: 'date',
              format: 'strict_date_optional_time||epoch_millis',
            },
            dateLastViewed: {
              type: 'date',
              format: 'strict_date_optional_time||epoch_millis',
            },
            dateSubmitted: {
              type: 'date',
              format: 'strict_date_optional_time||epoch_millis',
            },
            tickets: {
              type: 'string',
            },
            archived: {
              type: 'boolean',
            },
            products: {
              type: 'string',
            },
            viewCount: {
              type: 'long',
            },
          }
        }
      })
      .then(() => utils.getAllFromDb({}, 'kb'))
        .then(docs => utils.bulkAdd(docs, 'kb'))
          .then(() => console.log('KB initialized successfully!'))
    })
  })
  .catch((err) => console.log('error initializing KB, ', err));
};
