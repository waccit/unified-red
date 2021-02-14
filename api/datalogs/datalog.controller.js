const app = require('express');
const router = app.Router();
const datalogService = require('./datalog.service');
const authorize = require('../authorize');
const Role = require('../users/role.model');
const jsonParser = require('body-parser').json();

/*
Data Log Access:
        1 2 3 4 5 6 7 8 9 10    Functions
View	Y Y Y Y Y - - - Y Y     query
Enable	N Y Y Y Y - - - Y Y
Clear	N Y Y Y Y - - - Y Y
Add	N N N N N - - - Y Y
Edit	N N Y Y Y - - - Y Y     
Delete	N N N N N - - - Y Y     
*/
router.put('/', jsonParser, authorize(Role.Level01), query);

module.exports = router;

// curl test:
// curl -X PUT -d '{ "topic": "some/sensor/a" }' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN"  http://localhost:1880/api/datalog
function query(req, res, next) {
    datalogService
        .query(req.body)
        .then((entries) => res.json(entries))
        .catch((err) => next(err));
}
