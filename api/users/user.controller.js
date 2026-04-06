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
router.get('/', authorize(Role.Level5), getAll);
router.get('/current', authorize(Role.Level1), getCurrent);
router.get('/:id', authorize(Role.Level5), getById);
router.post('/', jsonParser, authorize(Role.Level5), add);
router.put('/:id', jsonParser, authorize(Role.Level5), update);
router.delete('/:id', authorize(Role.Level5), _delete);

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
        .getAll(req.user.role)
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
        .then((user) => {
            if (!user || user.role > req.user.role) return res.sendStatus(404);
            res.json(user);
        })
        .catch((err) => next(err));
}

// curl test:
// curl -X POST -d '{ "firstName": "Jason", "lastName": "Watmore", "username": "test", "password": "Password123", "role":10, "email":"sarbid@wasocal.com", "expirationDate": "2021-05-13T21:18:57.008Z" }' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/users/
function add(req, res, next) {
    if (req.body.role && req.body.role > req.user.role) {
        return res.status(403).json({ message: 'Cannot create a user with a higher role than your own' });
    }
    userService
        .create(req.body)
        .then((user) => res.json(user))
        .catch((err) => next(err));
}

// curl test:
// curl -X PUT -d '{ "enabled": false }' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/users/$ID
// curl -X PUT -d '{ "expirationDate": "2020-05-11T21:18:57.008Z" }' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/users/$ID
async function update(req, res, next) {
    try {
        const targetUser = await userService.getById(req.params.id);
        if (!targetUser || targetUser.role > req.user.role) {
            return res.sendStatus(404);
        }
        if (req.params.id === req.user.sub.toString()) {
            delete req.body.role; // users cannot change their own role
        } else if (req.body.role !== undefined && req.body.role > req.user.role) {
            return res.status(403).json({ message: 'Cannot assign a role higher than your own' });
        }
        const user = await userService.update(req.params.id, req.body);
        res.json(user);
    } catch (err) {
        next(err);
    }
}

// curl test:
// curl -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/users/$ID
async function _delete(req, res, next) {
    try {
        const targetUser = await userService.getById(req.params.id);
        if (!targetUser || targetUser.role > req.user.role) {
            return res.sendStatus(404);
        }
        await userService.delete(req.params.id);
        res.json({});
    } catch (err) {
        next(err);
    }
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
