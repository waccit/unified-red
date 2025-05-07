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
    try {
        return await mongoose.connect(conn, { useNewUrlParser: true, useUnifiedTopology: true });
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

let connectionPromise = null;
let reconnectInterval = null;

let initialConnection = false;
const RECONNECT_INTERVAL_MS = 5000;

module.exports = {
    testConnection,
    connect: function (dbConnection) {
        //'mongodb://localhost:27017/unified-red'

        if (!connectionPromise) {
            connectionPromise = new Promise((resolve, reject) => {
                // Set up connection event handlers
                mongoose.connection.on('connected', () => {
                    console.log('Mongoose connected to MongoDB');
                    initialConnection = true;

                    // clear interval
                    if (reconnectInterval) {
                        clearInterval(reconnectInterval);
                        reconnectInterval = null;
                    }

                    resolve(mongoose.connection);
                });

                mongoose.connection.on('error', (err) => {
                    console.error('Mongoose connection error:', err);
                    console.error('Connection URL:', dbConnection);
                    console.error('Is MongoDB running? Try running: mongod');
                    if (!initialConnection) {
                        reject(err);

                        // reconnect
                        startReconnection();
                    }
                });

                mongoose.connection.on('disconnected', () => {
                    console.log('Mongoose disconnected from MongoDB');

                    if (!initialConnection) {
                        reject(new Error('Disconnected from MongoDB before connection was established'));

                        // reconnect
                        startReconnection();
                    }
                });

                // Attempt connection
                mongoose.connect(dbConnection, connectionOptions).catch((err) => {
                    console.error('Initial connection error:', err);
                    reject(err);
                });
            });
        }

        mongoose.Promise = global.Promise;

        // setup associations/lookup models
        const lookupModels = {
            'Logger': { from: 'loggers', localField: 'logger', foreignField: '_id', as: 'refLogger' },
        };

        function status() {
            return mongoose.STATES[mongoose.connection.readyState];
        }

        function initiateConnection() {
            mongoose.connect(dbConnection, connectionOptions).catch((err) => {
                console.error('Initial connection error:', err);
            });
        }

        // this method starts manual reconnection when the connection was not initially made
        function startReconnection() {
            if (!reconnectInterval) {
                reconnectInterval = setInterval(() => {
                    console.log('Attempting to reconnect...');
                    initiateConnection();
                }, RECONNECT_INTERVAL_MS);
            }
        }

        // Helper function to ensure operations wait for connection
        function ensureConnection(collection, args, operation) {
            return async () => {
                // 1 = connected
                if (mongoose.connection.readyState !== 1) {
                    try {
                        await connectionPromise;
                    } catch (err) {
                        console.error(`Database operation ${operation} error:`, err);
                        console.error(`Database not connected for operation ${operation}:`, err);
                        return null;
                    }
                }

                try {
                    // Check if the operation exists on the collection
                    if (typeof collection[operation] !== 'function') {
                        console.error(`Operation '${operation}' is not a function on the collection`);
                        console.error('Collection:', collection);
                        return null;
                    }
                    return await collection[operation](...args);
                } catch (err) {
                    console.error(`Database operation ${operation} error:`, err);
                    return null;
                }
            };
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
            count: (collection, ...args) => ensureConnection(collection, args, 'count')(),
            create: (collection, ...args) => ensureConnection(collection, args, 'create')(),
            deleteMany: (collection, ...args) => ensureConnection(collection, args, 'deleteMany')(),
            distinct: (collection, ...args) => ensureConnection(collection, args, 'distinct')(),
            // count: (collection) => collection.count(),
            // create: (collection, ...args) => collection.create(...args),
            // deleteMany: (collection, ...args) => collection.deleteMany(...args),
            // distinct: (collection, ...args) => collection.distinct(...args),
            join: async (collection, model, criteria, projection, options) => {
                // 1 = connected
                if (mongoose.connection.readyState !== 1) {
                    try {
                        await connectionPromise;
                    } catch (err) {
                        console.error('Database not connected for join operation:', err);
                        return [];
                    }
                }

                try {
                    await connectionPromise;

                    let project = { _id: 0 };
                    for (const p of projection) {
                        let [whole, prefix, field] = new RegExp('^(' + model + '.)?(.+)$').exec(p);
                        project[field] = prefix ? '$ref' + whole : 1;
                    }
                    return collection.aggregate([
                        { $match: criteria },
                        { $limit: options.limit || 10000 },
                        { $lookup: lookupModels[model] },
                        { $unwind: '$ref' + model },
                        { $project: project },
                    ]);
                } catch (err) {
                    console.error(`Database operation join error:`, err);
                    return null;
                }
            },
            find: (collection, ...args) => ensureConnection(collection, args, 'find')(),
            findById: (collection, ...args) => ensureConnection(collection, args, 'findById')(),
            findByIdAndRemove: (collection, ...args) => ensureConnection(collection, args, 'findByIdAndRemove')(),
            findOne: (collection, ...args) => ensureConnection(collection, args, 'findOne')(),
            findOneAndDelete: (collection, ...args) => ensureConnection(collection, args, 'findOneAndDelete')(),
            update: (collection, ...args) => ensureConnection(collection, args, 'update')(),
            // find: (collection, ...args) => collection.find(...args),
            // findById: (collection, ...args) => collection.findById(...args),
            // findByIdAndRemove: (collection, ...args) => collection.findByIdAndRemove(...args),
            // findOne: (collection, ...args) => collection.findOne(...args),
            // findOneAndDelete: (collection, ...args) => collection.findOneAndDelete(...args),
            // update: (collection, ...args) => collection.update(...args),
        };
    },
};
