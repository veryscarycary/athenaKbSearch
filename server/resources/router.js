'use strict'
const router = require('../config/middleware.js').router();
const api = require('./controller.js');

// router.get('/api/:kb/stub', api.getStubs); //return stubs. this will be how the kb search service updates

router.route('/api')
  .get(api.getArticle)
  .post(api.createArticle);

router.route('/api/:id')
  .get(api.getArticle)
  .put(api.editArticle)
  .delete(api.deleteArticle);

router.get('/', api.pingDb)

module.exports = router;
