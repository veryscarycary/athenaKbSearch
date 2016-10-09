'use strict'
const router = require('../config/middleware.js').router();
const api = require('./controller.js');

router.get('/', api.pingEs);
router.get('/api/addIndex', api.addIndex);
router.get('/api/findMostRecent', api.findMostRecent);
router.get('/api/delete', api.deleteAllRecords);
router.get('/api/count', api.count);
router.get('/api/search', api.search);
router.get('/api/searchAll', api.searchAll);
router.get('/api/mapping', api.mapping);
router.get('/api/checkIndexExists', api.checkIndexExists);
module.exports = router;
