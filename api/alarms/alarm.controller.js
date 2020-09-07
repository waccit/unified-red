const app = require('express');
const router = app.Router();
const alarmService = require('./alarm.service');
const authorize = require('../authorize');
const Role = require('../users/role.model');

router.get('/',         authorize(Role.Level01), getAll);
router.get('/:id',      authorize(Role.Level01), getById);
router.put('/:id',      authorize(Role.Level01), update);
router.get('/ack/:id',  authorize(Role.Level01), ackById);
router.post('/ack/',    authorize(Role.Level01), ackByTopic);
router.delete('/:id',   authorize(Role.Level01), _delete);

module.exports = router;

function getAll(req, res, next) {
    alarmService
        .getAll()
        .then((alarms) => res.json(alarms))
        .catch((err) => next(err));
}

function getById(req, res, next) {
    alarmService
        .getById(req.params.id)
        .then((alarm) => (alarm ? res.json(alarm) : res.sendStatus(404)))
        .catch((err) => next(err));
}

function update(req, res, next) {
    alarmService
        .update(req.params.id, req.body)
        .then((alarm) => res.json(alarm))
        .catch((err) => next(err));
}

function ackById(req, res, next) {
    alarmService
        .ackById(req.params.id)
        .then((alarm) => res.json(alarm))
        .catch((err) => next(err));
}

function ackByTopic(req, res, next) {
    alarmService
        .ackByTopic(req.body.topic)
        .then((alarm) => res.json(alarm))
        .catch((err) => next(err));
}

function _delete(req, res, next) {
    alarmService
        .delete(req.params.id)
        .then(() => res.json({}))
        .catch((err) => next(err));
}
