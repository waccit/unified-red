const app = require('express');
const router = app.Router();
const installService = require('./install.service');

router.get('/',  isInstalled);
router.post('/', install);
router.post('/testdb/', testDbConnection);
router.post('/testsmtp/', testSmtpServer);

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
        .testDbConnection(req.body.mongoConnection)
        .then((result) => res.json(result))
        .catch((err) => next(err));
}

function testSmtpServer(req, res, next) {
    installService
        .testSmtpServer(req.body.smtp)
        .then((result) => res.json(result))
        .catch((err) => next(err));
}