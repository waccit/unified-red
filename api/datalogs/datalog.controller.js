const app = require('express');
const router = app.Router();
const datalogService = require('./datalog.service');
const authorize = require('../authorize');
const Role = require('../users/role.model');
const jsonParser = require('body-parser').json();

router.put('/', jsonParser, authorize(Role.Level01), query);

module.exports = router;

// curl test:
// curl -X PUT -d '{ "topic": "some/sensor/a" }' -H 'Content-Type: application/json' -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZWU2ZmQ1ZjJkNzc1MGNkNjg4N2M5MzIiLCJyb2xlIjoxMCwiaWF0IjoxNjAwOTkyMjAyfQ.zrn3AVBgLeKuhIIkj_iP39Rwg34V_nklRaD2ijjjlxk"  http://localhost:1880/api/datalog
function query(req, res, next) {
    datalogService
        .query(req.body)
        .then((entries) => res.json(entries))
        .catch((err) => next(err));
}
