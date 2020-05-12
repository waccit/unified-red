const app = require('express');
// const router = express.Router();

module.exports = app;

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

// app.use('/users', require('./users/user.controller'));
app.use('/hello', require('./hello.controller'));