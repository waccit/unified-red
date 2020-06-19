const app = require('express').Router();

app.use('/users', require('./users/user.controller'));
app.use('/roles', require('./users/role.controller'));

module.exports = app;
