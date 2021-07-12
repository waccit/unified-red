/*
Credit to Jason Watmore (https://github.com/cornflourblue) for user management API example.
Source: https://github.com/cornflourblue/node-mongo-registration-login-api
*/

const app = require('express');
const router = app.Router();
const userService = require('./user.service');
const authorize = require('../authorize');
const Role = require('./role.model');
const jsonParser = require('body-parser').json();

// public routes
router.post('/authenticate', jsonParser, authenticate);
router.post('/register', jsonParser, register);
router.get('/register', canRegister);
router.get('/forgot/:username', forgot);
router.post('/reset/:token', jsonParser, resetPassword);

/*
Users Access:
        1 2 3 4 5 6 7 8 9 10    Functions
View	Y Y Y Y Y - - - Y Y     getCurrent
Add		N N N N Y - - - Y Y     add
Edit	N N N N Y - - - Y Y     getAll, getById, update
Delete	N N N N Y - - - Y Y     delete
*/
// protected routes
router.get('/', authorize(Role.Level05), getAll);
router.get('/current', authorize(Role.Level01), getCurrent);
router.get('/:id', authorize(Role.Level05), getById);
router.post('/', jsonParser, authorize(Role.Level05), add);
router.put('/:id', jsonParser, authorize(Role.Level05), update);
router.delete('/:id', authorize(Role.Level05), _delete);

module.exports = router;

// curl test:
// curl -X POST -d '{ "username": "user", "password": "Password123" }' -H 'Content-Type: application/json' http://localhost:1880/api/users/authenticate
function authenticate(req, res, next) {
    userService
        .authenticate(req.body)
        .then((user) =>
            user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' })
        )
        .catch((err) => next(err));
}

// curl test:
// curl http://localhost:1880/api/users/register
function canRegister(req, res, next) {
    userService
        .canRegister()
        .then((x) => res.json({ 'allowed': x }))
        .catch((err) => next(err));
}

// curl test:
// curl -X POST -d '{ "firstName": "Jason", "lastName": "Watmore", "username": "test", "password": "Password123", "email":"sarbid@wasocal.com", "expirationDate": "2021-05-13T21:18:57.008Z" }' -H 'Content-Type: application/json' http://localhost:1880/api/users/register
function register(req, res, next) {
    userService
        .register(req.body)
        .then((user) => res.json(user))
        .catch((err) => next(err));
}

// curl test:
// curl -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/users/
function getAll(req, res, next) {
    userService
        .getAll()
        .then((users) => res.json(users))
        .catch((err) => next(err));
}

// curl test:
// curl -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/users/current
function getCurrent(req, res, next) {
    userService
        .getById(req.user.sub)
        .then((user) => (user ? res.json(user) : res.sendStatus(404)))
        .catch((err) => next(err));
}

// curl test:
// curl -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/users/$ID
function getById(req, res, next) {
    userService
        .getById(req.params.id)
        .then((user) => (user ? res.json(user) : res.sendStatus(404)))
        .catch((err) => next(err));
}

// curl test:
// curl -X POST -d '{ "firstName": "Jason", "lastName": "Watmore", "username": "test", "password": "Password123", "role":10, "email":"sarbid@wasocal.com", "expirationDate": "2021-05-13T21:18:57.008Z" }' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/users/
function add(req, res, next) {
    userService
        .create(req.body)
        .then((user) => res.json(user))
        .catch((err) => next(err));
}

// curl test:
// curl -X PUT -d '{ "enabled": false }' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/users/$ID
// curl -X PUT -d '{ "expirationDate": "2020-05-11T21:18:57.008Z" }' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/users/$ID
function update(req, res, next) {
    userService
        .update(req.params.id, req.body)
        .then((user) => res.json(user))
        .catch((err) => next(err));
}

// curl test:
// curl -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/users/$ID
function _delete(req, res, next) {
    userService
        .delete(req.params.id)
        .then(() => res.json({}))
        .catch((err) => next(err));
}

// curl test:
// curl http://localhost:1880/api/users/forgot/user
function forgot(req, res, next) {
    userService
        .generateResetToken(req, req.params.username)
        .then(() => res.json({}))
        .catch((err) => next(err));
}

// curl test:
// curl -X POST -d '{ "password": "Password1234" }' -H 'Content-Type: application/json' http://localhost:1880/api/users/reset/$RESET_TOKEN
function resetPassword(req, res, next) {
    userService
        .resetPassword(req.params.token, req.body)
        .then(() => res.json({}))
        .catch((err) => next(err));
}
