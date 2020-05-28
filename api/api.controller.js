const app = require('express').Router();

app.use('/users', require('./users/user.controller'));

module.exports = app;
