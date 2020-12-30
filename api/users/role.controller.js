const app = require('express');
const router = app.Router();
const roleService = require('./role.service');
const authorize = require('../authorize');
const Role = require('./role.model');
const jsonParser = require('body-parser').json();

router.get('/', authorize(Role.Level01), getAll);
router.put('/:level', jsonParser, authorize(Role.Level01), update);

module.exports = router;

function getAll(req, res, next) {
    roleService
        .getAll()
        .then((roles) => res.json(roles))
        .catch((err) => next(err));
}

function update(req, res, next) {
    roleService
        .update(req.params.level, req.body)
        .then((role) => res.json(role))
        .catch((err) => next(err));
}
