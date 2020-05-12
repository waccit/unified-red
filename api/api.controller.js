const app = require('express');
// const router = express.Router();

// routes
// router.all('/users', require('./users/users.controller'));
// router.all('/session', require('./session/session.controller'));
// router.all('/session', require('./session/session.controller'));

// router.get('/', dummy);
// router.get('/example', dummy);
// router.get('/:id', dummy);
// router.put('/:id', dummy);
// router.delete('/:id', dummy);

// module.exports = router;

// function dummy(req, res, next) {
// }

app.use('/users', require('api/users/users.controller'));