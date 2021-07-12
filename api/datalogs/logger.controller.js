const app = require('express');
const router = app.Router();
const datalogService = require('./datalog.service');
const authorize = require('../authorize');
const Role = require('../users/role.model');
const jsonParser = require('body-parser').json();

/*
Data Log Access:
        1 2 3 4 5 6 7 8 9 10    Functions
View	Y Y Y Y Y - - - Y Y     list, getLogger
Enable	N Y Y Y Y - - - Y Y
Clear	N Y Y Y Y - - - Y Y
Add	    N N N N N - - - Y Y
Edit	N N Y Y Y - - - Y Y     configureLogger
Delete	N N N N N - - - Y Y     deleteLogger
*/
router.get('/', authorize(Role.Level01), list);
router.put('/', jsonParser, authorize(Role.Level01), getLogger);
router.post('/', jsonParser, authorize(Role.Level03), configureLogger);
router.delete('/', jsonParser, authorize(Role.Level09), deleteLogger);

module.exports = router;

// curl test:
// curl -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/loggers
function list(req, res, next) {
    datalogService
        .list()
        .then((topics) => res.json(topics))
        .catch((err) => next(err));
}

// curl test:
// curl -X PUT -d '{ "topic": "some/sensor/a" }' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN"  http://localhost:1880/api/loggers
function getLogger(req, res, next) {
    datalogService
        .getLogger(req.body.topic)
        .then((logger) => res.json(logger))
        .catch((err) => next(err));
}

// curl test:
// curl -X POST -d '{ "topic": "some/sensor/a", "units": "%" }' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/loggers
function configureLogger(req, res, next) {
    datalogService
        .configureLogger(req.body)
        .then((logger) => res.json(logger))
        .catch((err) => next(err));
}

// curl test:
// curl -X DELETE -d '{ "topic": "some/sensor/a" }' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN"  http://localhost:1880/api/loggers
function deleteLogger(req, res, next) {
    datalogService
        .deleteLogger(req.body.topic)
        .then((r) => res.json(r))
        .catch((err) => next(err));
}
