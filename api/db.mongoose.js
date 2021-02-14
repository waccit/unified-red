/*
Credit to Jason Watmore (https://github.com/cornflourblue) for user management API example.
Source: https://github.com/cornflourblue/node-mongo-registration-login-api
*/

const mongoose = require('mongoose');

const connectionOptions = {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
};

async function testConnection(conn) {
    return await mongoose.connect(conn, { useNewUrlParser: true, useUnifiedTopology: true });
}

module.exports = {
    testConnection,
    connect: function(dbConnection) {
        //'mongodb://localhost:27017/unified-red'
        mongoose.connect(dbConnection, connectionOptions);
        mongoose.Promise = global.Promise;

        // setup associations/lookup models
        const lookupModels = {
            'Logger': { from: 'loggers', localField: 'logger', foreignField: '_id', as: 'refLogger' }
        };

        function status() {
            return mongoose.STATES[mongoose.connection.readyState];
        }

        return {
            type: 'mongodb',
            status,
            testConnection,
            User: require('./models/mongoose/user.model'),
            Role: require('./models/mongoose/role-name.model'),
            Alarm: require('./models/mongoose/alarm.model'),
            Logger: require('./models/mongoose/logger.model'),
            Datalog: require('./models/mongoose/datalog.model'),
            count: (collection) => collection.count(),
            create: (collection, ...args) => collection.create(...args),
            deleteMany: (collection, ...args) => collection.deleteMany(...args),
            distinct: (collection, ...args) => collection.distinct(...args),
            join: (collection, model, criteria, projection, options) => {
                let project = { _id: 0 };
                for (const p of projection) {
                    let [ whole, prefix, field ] = new RegExp('^(' + model + '\.)?(.+)$').exec(p);
                    project[field] = prefix ? '$ref' + whole : 1;
                }
                return collection.aggregate([
                    { $match: criteria },
                    { $limit: options.limit || 10000 },
                    { $lookup: lookupModels[model] },
                    { $unwind: '$ref'+model },
                    { $project: project },
                ]);
            },
            find: (collection, ...args) => collection.find(...args),
            findById: (collection, ...args) => collection.findById(...args),
            findByIdAndRemove: (collection, ...args) => collection.findByIdAndRemove(...args),
            findOne: (collection, ...args) => collection.findOne(...args),
            findOneAndDelete: (collection, ...args) => collection.findOneAndDelete(...args),
            update: (collection, ...args) => collection.update(...args),
        };
    }
};