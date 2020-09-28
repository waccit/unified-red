const app = require('express');
const router = app.Router();
const datalogService = require('./datalog.service');
const authorize = require('../authorize');
const Role = require('../users/role.model');

router.get('/', authorize(Role.Level01), list);
router.put('/', authorize(Role.Level01), getLogger);
router.post('/', authorize(Role.Level01), configureLogger);
router.delete('/', authorize(Role.Level01), deleteLogger);

module.exports = router;

// curl test:
// curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWU2ZmQ1ZjJkNzc1MGNkNjg4N2M5MzIiLCJyb2xlIjoxMCwiaWF0IjoxNjAwOTkyMjAyfQ.zrn3AVBgLeKuhIIkj_iP39Rwg34V_nklRaD2ijjjlxk" http://localhost:1880/api/loggers
function list(req, res, next) {
    datalogService
        .list()
        .then((topics) => res.json(topics))
        .catch((err) => next(err));
}

// curl test:
// curl -X PUT -d '{ "topic": "some/sensor/a" }' -H 'Content-Type: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWU2ZmQ1ZjJkNzc1MGNkNjg4N2M5MzIiLCJyb2xlIjoxMCwiaWF0IjoxNjAwOTkyMjAyfQ.zrn3AVBgLeKuhIIkj_iP39Rwg34V_nklRaD2ijjjlxk"  http://localhost:1880/api/loggers
function getLogger(req, res, next) {
    datalogService
        .getLogger(req.body.topic)
        .then((logger) => res.json(logger))
        .catch((err) => next(err));
}

// curl test:
// curl -X POST -d '{ "topic": "some/sensor/a", "units": "%" }' -H 'Content-Type: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWU2ZmQ1ZjJkNzc1MGNkNjg4N2M5MzIiLCJyb2xlIjoxMCwiaWF0IjoxNjAwOTkyMjAyfQ.zrn3AVBgLeKuhIIkj_iP39Rwg34V_nklRaD2ijjjlxk" http://localhost:1880/api/loggers
function configureLogger(req, res, next) {
    datalogService
        .configureLogger(req.body)
        .then((logger) => res.json(logger))
        .catch((err) => next(err));
}

// curl test:
// curl -X DELETE -d '{ "topic": "some/sensor/a" }' -H 'Content-Type: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWU2ZmQ1ZjJkNzc1MGNkNjg4N2M5MzIiLCJyb2xlIjoxMCwiaWF0IjoxNjAwOTkyMjAyfQ.zrn3AVBgLeKuhIIkj_iP39Rwg34V_nklRaD2ijjjlxk"  http://localhost:1880/api/loggers
function deleteLogger(req, res, next) {
    datalogService
        .deleteLogger(req.body.topic)
        .then((r) => res.json(r))
        .catch((err) => next(err));
}
