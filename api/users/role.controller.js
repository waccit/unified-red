const app = require('express');
const router = app.Router();
const roleService = require('./role.service');
const authorize = require('../authorize');
const Role = require('./role.model');
const jsonParser = require('body-parser').json();

/*
Roles Access:
        1 2 3 4 5 6 7 8 9 10    Functions
View	Y Y Y Y Y - - - Y Y     getAll
Edit	N N N N Y - - - Y Y     update
*/
router.get('/', authorize(Role.Level01), getAll);
router.put('/:level', jsonParser, authorize(Role.Level05), update);

module.exports = router;

// curl test:
// curl -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/roles/
function getAll(req, res, next) {
    roleService
        .getAll()
        .then((roles) => res.json(roles))
        .catch((err) => next(err));
}

// curl test:
// curl -X PUT -d '{ "name": "View123" }' -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" http://localhost:1880/api/roles/1
function update(req, res, next) {
    roleService
        .update(req.params.level, req.body)
        .then((role) => res.json(role))
        .catch((err) => next(err));
}
