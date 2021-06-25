const app = require('express').Router();

app.use('/install', require('./install/install.controller'));
app.use('/users', require('./users/user.controller'));
app.use('/roles', require('./users/role.controller'));
app.use('/alarms', require('./alarms/alarm.controller'));
app.use('/loggers', require('./datalogs/logger.controller'));
app.use('/datalog', require('./datalogs/datalog.controller'));
app.use('/audit', require('./audit/audit.controller'));

module.exports = app;
