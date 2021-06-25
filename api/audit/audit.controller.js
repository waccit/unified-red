const app = require('express');
const authorize = require('../authorize');
const router = app.Router();
const jsonParser = require('body-parser').json();
const auditService = require('./audit.service.js');
const Role = require('../users/role.model');

router.get('/log/:name', jsonParser, authorize(Role.Level05), getLog);
router.get('/logs', jsonParser, authorize(Role.Level05), getLogsList);

module.exports = router;

function getLogsList(req, res, next) {
    auditService
        .getLogsList()
        .then((list) => {
            list = list
                .filter((file) => !file.startsWith('.')) // do not include hidden files (e.g., .gitignore)
                .sort()
                .reverse(); // list is in desc order (i.e., latest log first)
            res.json(list);
        })
        .catch((err) => next(err));
}

function getLog(req, res, next) {
    auditService
        .getLog(req.params.name)
        .then((log) => {
            res.json(JSON.parse(log));
        })
        .catch((err) => next(err));
}
