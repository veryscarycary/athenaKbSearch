'use strict'
const router = require('../config/middleware.js').router();
const api = require('./controller.js');

//router.get('/api', api.getStubs); //get all stubs
//router.get('/api/:id', api.getStubs); //get a single stub

//router.get('/update', api.updateFromMaster); //update collection from master

//router.get('/refresh', api.refreshFromMaster); //drop collection and query a new one from master

router.get('/', api.pingEs);
router.get('/addIndex', api.addIndex);
router.get('/findMostRecent', api.findMostRecent);
router.get('/delete', api.deleteAllRecords);
router.get('/count', api.count);
router.post('/search', api.search);
//router.get('/findRecent', api.findRecent);

module.exports = router;
