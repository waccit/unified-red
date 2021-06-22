const app = require('express');
const authorize = require('../authorize');
const router = app.Router();
const jsonParser = require('body-parser').json();

const Role = require('../users/role.model');
const fs = require('fs');

router.get('/', jsonParser, authorize(Role.Level05), getAll);

module.exports = router;

function getAll(req, res, next) {
    // TODO: this needs to be updated to include db queries
    // this solution is temporary
    fs.readFile(__dirname + '/audit_log.json', (err, log) => {
        res.set('Content-Type', 'application/json');
        res.send(log);
    });
}
