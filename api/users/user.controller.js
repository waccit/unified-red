/*
Credit to Jason Watmore (https://github.com/cornflourblue) for user management API example.
Source: https://github.com/cornflourblue/node-mongo-registration-login-api
*/

const app = require('express');
const router = app.Router();
const userService = require('./user.service');

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/register', canRegister);
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);
router.get('/forgot/:username', forgot);
router.post('/reset/:token', resetPassword);

module.exports = router;

// curl test: 
// curl -X POST -d '{ "username": "user", "password": "Password123" }' -H 'Content-Type: application/json' http://localhost:1880/api/users/authenticate
function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

// curl test:
// curl http://localhost:1880/api/users/register
function canRegister(req, res, next) {
    userService.canRegister()
        .then(x => res.json({ "allowed": x }))
        .catch(err => next(err));
}

// curl test:
// curl -X POST -d '{ "firstName": "Jason", "lastName": "Watmore", "username": "user", "password": "Password123", "email":"sarbid@wasocal.com", "expirationDate": "2021-05-13T21:18:57.008Z" }' -H 'Content-Type: application/json' http://localhost:1880/api/users/register
function register(req, res, next) {
    userService.create(req.body)
        .then(user => res.json(user))
        .catch(err => next(err));
}

// curl test:
// curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJiMTg2OWIxODUzOTNiZmJjMjExYzciLCJpYXQiOjE1ODkzMTk4NTh9.iuR2Z1n1POKFY6nt71GfETg4dK_frHr6zp_onF-7GV8" http://localhost:1880/api/users/
function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

// curl test:
// curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJiMTg2OWIxODUzOTNiZmJjMjExYzciLCJpYXQiOjE1ODkzMTk4NTh9.iuR2Z1n1POKFY6nt71GfETg4dK_frHr6zp_onF-7GV8" http://localhost:1880/api/users/current
function getCurrent(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

// curl test:
// curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJiMTg2OWIxODUzOTNiZmJjMjExYzciLCJpYXQiOjE1ODkzMTk4NTh9.iuR2Z1n1POKFY6nt71GfETg4dK_frHr6zp_onF-7GV8" http://localhost:1880/api/users/5ebb2e23ef03f345cd1d3b03
function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

// curl test:
// curl -X PUT -d '{ "enabled": false }' -H 'Content-Type: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJiMTg2OWIxODUzOTNiZmJjMjExYzciLCJpYXQiOjE1ODkzMTk4NTh9.iuR2Z1n1POKFY6nt71GfETg4dK_frHr6zp_onF-7GV8" http://localhost:1880/api/users/5ebb2e23ef03f345cd1d3b03
// curl -X PUT -d '{ "expirationDate": "2020-05-11T21:18:57.008Z" }' -H 'Content-Type: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJiMTg2OWIxODUzOTNiZmJjMjExYzciLCJpYXQiOjE1ODkzMTk4NTh9.iuR2Z1n1POKFY6nt71GfETg4dK_frHr6zp_onF-7GV8" http://localhost:1880/api/users/5ebb2e23ef03f345cd1d3b03
function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(user => res.json(user))
        .catch(err => next(err));
}

// curl test:
// curl -X DELETE -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJiMTg2OWIxODUzOTNiZmJjMjExYzciLCJpYXQiOjE1ODkzMTk4NTh9.iuR2Z1n1POKFY6nt71GfETg4dK_frHr6zp_onF-7GV8" http://localhost:1880/api/users/5ebb0832baefe9371297c006
function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

// curl test:
// curl http://localhost:1880/api/users/forgot/user
function forgot(req, res, next) {
    userService.generateResetToken(req, req.params.username)
        .then(() => res.json({}))
        .catch(err => next(err));
}

// curl test: 
// curl -X POST -d '{ "password": "Password123" }' -H 'Content-Type: application/json' http://localhost:1880/api/users/reset/2a231b23-7020-4bed-aee5-2f5e6432968c
function resetPassword(req, res, next) {
    userService.resetPassword(req.params.token, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}
