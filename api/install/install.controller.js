const app = require('express');
const router = app.Router();
const installService = require('./install.service');
const jsonParser = require('body-parser').json();

router.get('/', isInstalled);
router.post('/', jsonParser, install);
router.post('/testdb/', jsonParser, testDbConnection);
router.post('/testsmtp/', jsonParser, testSmtpServer);

module.exports = router;

function isInstalled(req, res, next) {
    installService
        .isInstalled()
        .then((result) => res.json(result))
        .catch((err) => next(err));
}

function install(req, res, next) {
    installService
        .install(req.body)
        .then((result) => res.json(result))
        .catch((err) => next(err));
}

function testDbConnection(req, res, next) {
    installService
        .testDbConnection(req.body.dbConnection)
        .then((result) => res.json(result))
        .catch((err) => next(err));
}

function testSmtpServer(req, res, next) {
    installService
        .testSmtpServer(req.body.smtp)
        .then((result) => res.json(result))
        .catch((err) => next(err));
}
