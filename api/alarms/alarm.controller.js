const app = require('express');
const router = app.Router();
const alarmService = require('./alarm.service');
const authorize = require('../authorize');
const Role = require('../users/role.model');
const jsonParser = require('body-parser').json();

/*
Alarm Access:
        1 2 3 4 5 6 7 8 9 10    Functions
View	Y Y Y Y Y - - - Y Y     getAll, getRecent, getById, getByTopic
Enable	N Y Y Y Y - - - Y Y
Ack		N Y Y Y Y - - - Y Y     ackById, ackByTopic
Add	    N N N N N - - - Y Y
Edit	N N Y Y Y - - - Y Y     update
Delete	N N N N N - - - Y Y     delete
*/
router.get('/all/', authorize(Role.Level01), getAll);
router.get('/recent/:state/', authorize(Role.Level01), getRecent);
router.get('/:id', authorize(Role.Level01), getById);
router.post('/topic/', jsonParser, authorize(Role.Level01), getByTopic);
router.put('/:id', jsonParser, authorize(Role.Level03), update);
router.get('/ack/:id', authorize(Role.Level02), ackById);
router.post('/ack/', jsonParser, authorize(Role.Level02), ackByTopic);
router.delete('/:id', authorize(Role.Level09), _delete);

module.exports = router;

// curl test:
// curl -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/alarms/all/
function getAll(req, res, next) {
    alarmService
        .getAll(req.query.limit)
        .then((alarms) => res.json(alarms))
        .catch((err) => next(err));
}

// curl test:
// curl -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/alarms/recent/active
function getRecent(req, res, next) {
    let state = req.params.state.toString().toLowerCase() === 'active';
    alarmService
        .getRecent(state, req.query.limit)
        .then((alarms) => res.json(alarms))
        .catch((err) => next(err));
}

// curl test:
// curl -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/alarms/$ID
function getById(req, res, next) {
    alarmService
        .getById(req.params.id)
        .then((alarm) => (alarm ? res.json(alarm) : res.sendStatus(404)))
        .catch((err) => next(err));
}

// curl test:
// curl -X POST -d '{ "topic": "test/info" }' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/alarms/topic/
function getByTopic(req, res, next) {
    alarmService
        .getByTopic(req.body.topic, req.body.limit)
        .then((alarm) => (alarm ? res.json(alarm) : res.sendStatus(404)))
        .catch((err) => next(err));
}

// curl test:
// curl -X PUT -d '{ "state": false }' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/alarms/$ID
function update(req, res, next) {
    alarmService
        .update(req.params.id, req.body)
        .then((alarm) => res.json(alarm))
        .catch((err) => next(err));
}

// curl test:
// curl -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/alarms/ack/$ID
// curl -X PUT -d '{ "acktime": 0 }' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/alarms/$ID
function ackById(req, res, next) {
    alarmService
        .ackById(req.params.id)
        .then((alarm) => res.json(alarm))
        .catch((err) => next(err));
}

// curl test:
// curl -X POST -d '{ "topic": "test/info" }' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/alarms/ack/
function ackByTopic(req, res, next) {
    alarmService
        .ackByTopic(req.body.topic)
        .then((alarm) => res.json(alarm))
        .catch((err) => next(err));
}

// curl test:
// curl -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/alarms/$ID
function _delete(req, res, next) {
    alarmService
        .delete(req.params.id)
        .then(() => res.json({}))
        .catch((err) => next(err));
}
