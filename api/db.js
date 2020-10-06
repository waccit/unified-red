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
if (process.env.MONGODB_URI || config.mongoConnection) {
    mongoose.connect(
        process.env.MONGODB_URI || config.mongoConnection,
        connectionOptions
    );
}
mongoose.Promise = global.Promise;

function status() {
    return mongoose.STATES[mongoose.connection.readyState];
}

function test(conn) {
    return mongoose.connect(conn, { useNewUrlParser: true, useUnifiedTopology: true });
}

module.exports = {
    status,
    test,
    User: require('./users/user.model'),
    Role: require('./users/role-name.model'),
    Alarm: require('./alarms/alarm.model'),
    Logger: require('./datalogs/logger.model'),
    Datalog: require('./datalogs/datalog.model'),
};
