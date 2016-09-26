const router = require('../config/middleware.js').router();
const api = require('./controller.js');

router.get('/api/:kb/stub', api.getStub);
// router.get('/api/search', api.getSearch);

// router.route('/api/user/:username/:password')
//   .get(api.checkAuth)
//   .post(api.createUser)
//   .put(api.editUser)
//   .delete(api.deleteUser);

router.get('/', api.pingDb)

module.exports = router;
