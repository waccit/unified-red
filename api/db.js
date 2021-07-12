const config = require('./config.json');
let mongoose = require('./db.mongoose');
let sequelize = require('./db.sequelize');

const dbConnection = process.env.DB_URI || config.dbConnection;
if (dbConnection.toLowerCase().startsWith('mongodb')) {
    module.exports = mongoose.connect(dbConnection);
}
else {
    module.exports = sequelize.connect(dbConnection);
}

module.exports.test = function(conn) {
    if (conn.toLowerCase().startsWith('mongodb')) {
        return mongoose.testConnection(conn);
    } else {
        return sequelize.testConnection(conn);
    }
}