const config = require('./config.json');
let mongoose = require('./db.mongoose');
let sequelize = require('./db.sequelize');
const { Op } = require('sequelize');

const dbConnection = process.env.DB_URI || config.dbConnection;
if (dbConnection.toLowerCase().startsWith('mongodb')) {
    module.exports = mongoose.connect(dbConnection);
} else {
    module.exports = sequelize.connect(dbConnection);
}

module.exports.test = function (conn) {
    if (conn.toLowerCase().startsWith('mongodb')) {
        return mongoose.testConnection(conn);
    } else {
        return sequelize.testConnection(conn);
    }
};

module.exports.chooseOperator = function(genericOperator) {
    const isMongo = dbConnection.toLowerCase().startsWith('mongodb');
    switch (genericOperator) {
        case '$eq':
            return isMongo ? '$eq' : Op.eq;
        case '$ne':
            return isMongo ? '$ne' : Op.ne;
        case '$gte':
            return isMongo ? '$gte' : Op.gte;
        case '$gt':
            return isMongo ? '$gt' : Op.gt;
        case '$lte':
            return isMongo ? '$lte' : Op.lte;
        case '$lt':
            return isMongo ? '$lt' : Op.lt;
        case '$not':
            return isMongo ? '$not' : Op.not;
        case '$in':
            return isMongo ? '$in' : Op.in;
        case '$notIn':
            return isMongo ? '$notIn' : Op.notIn;
        case '$nin':
            return isMongo ? '$nin' : Op.notIn;
        case '$is':
            return isMongo ? '$is' : Op.is;
        case '$like':
            return isMongo ? '$like' : Op.like;
        case '$notLike':
            return isMongo ? '$notLike' : Op.notLike;
        case '$iLike':
            return isMongo ? '$iLike' : Op.iLike;
        case '$notILike':
            return isMongo ? '$notILike' : Op.notILike;
        case '$regexp':
            return isMongo ? '$regexp' : Op.regexp;
        case '$notRegexp':
            return isMongo ? '$notRegexp' : Op.notRegexp;
        case '$iRegexp':
            return isMongo ? '$iRegexp' : Op.iRegexp;
        case '$notIRegexp':
            return isMongo ? '$notIRegexp' : Op.notIRegexp;
        case '$between':
            return isMongo ? '$between' : Op.between;
        case '$notBetween':
            return isMongo ? '$notBetween' : Op.notBetween;
        case '$overlap':
            return isMongo ? '$overlap' : Op.overlap;
        case '$contains':
            return isMongo ? '$contains' : Op.contains;
        case '$contained':
            return isMongo ? '$contained' : Op.contained;
        case '$adjacent':
            return isMongo ? '$adjacent' : Op.adjacent;
        case '$strictLeft':
            return isMongo ? '$strictLeft' : Op.strictLeft;
        case '$strictRight':
            return isMongo ? '$strictRight' : Op.strictRight;
        case '$noExtendRight':
            return isMongo ? '$noExtendRight' : Op.noExtendRight;
        case '$noExtendLeft':
            return isMongo ? '$noExtendLeft' : Op.noExtendLeft;
        case '$and':
            return isMongo ? '$and' : Op.and;
        case '$or':
            return isMongo ? '$or' : Op.or;
        case '$any':
            return isMongo ? '$any' : Op.any;
        case '$all':
            return isMongo ? '$all' : Op.all;
        case '$values':
            return isMongo ? '$values' : Op.values;
        case '$col':
            return isMongo ? '$col' : Op.col;
        default:
            throw new Error('Unknown operator: ' + genericOperator);
    }
}
