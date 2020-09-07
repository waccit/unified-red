const app = require('express').Router();

app.use('/users', require('./users/user.controller'));
app.use('/roles', require('./users/role.controller'));
app.use('/alarms', require('./alarms/alarm.controller'));

module.exports = app;
