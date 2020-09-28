/*
Credit to Jason Watmore (https://github.com/cornflourblue) for user management API example.
Source: https://github.com/cornflourblue/node-mongo-registration-login-api
*/

const config = require('./config.json');
const mongoose = require('mongoose');

const connectionOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
};
mongoose.connect(
    process.env.MONGODB_URI || config.mongoConnection,
    connectionOptions
);
mongoose.Promise = global.Promise;

module.exports = {
    User: require('./users/user.model'),
    Role: require('./users/role-name.model'),
    Alarm: require('./alarms/alarm.model'),
    Logger: require('./datalogs/logger.model'),
    Datalog: require('./datalogs/datalog.model'),
};
