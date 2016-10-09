const client = require('../../elasticsearch');

module.exports = () => {
  client.indices.create({
    index: 'kb',
  }, (err, resp) => {
    return err ? console.log(err) : console.log('kb indices created')
  });

  client.indices.create({
    index: 'ticket'
  }, (err, resp) => {
    return err ? console.log(err) : console.log('ticket indices created')
  });

  client.indices.putMapping({
    index: 'kb',
    type: 'article',
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
  }, (err, resp) => {
    return err ? console.log(err) : console.log('kb indices mapped')
  });


  client.indices.putMapping({
    index: 'ticket',
    type: 'ticket',
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
    }
  }, (err, resp) => {
    return err ? console.log(err) : console.log('ticket indices mapped')
  });
};
