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
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/:id', getById);
router.put('/:id', update);
router.delete('/:id', _delete);

module.exports = router;

// curl test: 
// curl -X POST -d '{ "username": "user", "password": "Password123" }' -H 'Content-Type: application/json' http://localhost:1880/api/users/authenticate
function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

// curl test:
// curl -X POST -d '{ "firstName": "Jason", "lastName": "Watmore", "username": "user", "password": "Password123", "expirationDate": "2020-05-13T21:18:57.008Z" }' -H 'Content-Type: application/json' http://localhost:1880/api/users/register
function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({}))
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
// curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJiMTg2OWIxODUzOTNiZmJjMjExYzciLCJpYXQiOjE1ODkzMTk4NTh9.iuR2Z1n1POKFY6nt71GfETg4dK_frHr6zp_onF-7GV8" http://localhost:1880/api/users/5ebb1869b185393bfbc211c7
function getById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

// curl test:
// curl -X PUT -d '{ "enabled": false }' -H 'Content-Type: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJiMTg2OWIxODUzOTNiZmJjMjExYzciLCJpYXQiOjE1ODkzMTk4NTh9.iuR2Z1n1POKFY6nt71GfETg4dK_frHr6zp_onF-7GV8" http://localhost:1880/api/users/5ebb1869b185393bfbc211c7
// curl -X PUT -d '{ "expirationDate": "2020-05-11T21:18:57.008Z" }' -H 'Content-Type: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJiMTg2OWIxODUzOTNiZmJjMjExYzciLCJpYXQiOjE1ODkzMTk4NTh9.iuR2Z1n1POKFY6nt71GfETg4dK_frHr6zp_onF-7GV8" http://localhost:1880/api/users/5ebb1869b185393bfbc211c7
function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

// curl test:
// curl -X DELETE -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWJiMTg2OWIxODUzOTNiZmJjMjExYzciLCJpYXQiOjE1ODkzMTk4NTh9.iuR2Z1n1POKFY6nt71GfETg4dK_frHr6zp_onF-7GV8" http://localhost:1880/api/users/5ebb0832baefe9371297c006
function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}