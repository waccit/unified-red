/*
Credit to Jason Watmore (https://github.com/cornflourblue) for user management API example.
Source: https://github.com/cornflourblue/node-mongo-registration-login-api
*/

const mongoose = require('mongoose');
const logger = require('./logger');

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
        logger.error('Error connecting to MongoDB:', err);
    }
}

let connectionPromise = null;
let reconnectInterval = null;
const RECONNECT_INTERVAL_MS = 5000;

module.exports = {
    testConnection,
    connect: function (dbConnection) {
        //'mongodb://localhost:27017/unified-red'

        if (!connectionPromise) {
            connectionPromise = new Promise((resolve, reject) => {
                // Set up connection event handlers
                mongoose.connection.on('connected', () => {
                    logger.info('Mongoose connected to MongoDB');

                    // clear interval
                    if (reconnectInterval) {
                        clearInterval(reconnectInterval);
                        reconnectInterval = null;
                    }

                    resolve(mongoose.connection);
                });

                mongoose.connection.on('error', (err) => {
                    logger.error('Is MongoDB running? Try running: mongod');
                    connectionPromise = null;
                    reject(new Error('Mongoose connection error:', err));
                    // reconnect
                    startReconnection();
                });

                mongoose.connection.on('disconnected', () => {
                    connectionPromise = null;
                    reject(new Error('Mongoose disconnected from MongoDB'));
                    // reconnect
                    startReconnection();
                });

                // Attempt connection
                mongoose.connect(dbConnection, connectionOptions).catch((err) => {
                    connectionPromise = null;
                    reject(new Error('Initial connection error:', err));
                });
            }).catch((err) => {
                logger.error(err);
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
                logger.error(err);
            });
        }

        // this method starts manual reconnection when the connection was not initially made
        function startReconnection() {
            if (!reconnectInterval) {
                reconnectInterval = setInterval(() => {
                    logger.info('Attempting to reconnect...');
                    initiateConnection();
                }, RECONNECT_INTERVAL_MS);
            }
        }

        async function ensureConnection() {
            if (mongoose.connection.readyState === 1) {
                return true;
            }
            // Don't return early, always ensure a connection exists or is established
            else if (mongoose.connection.readyState !== 1) {
                try {
                    logger.info('Waiting for connection...');
                    await connectionPromise;
                } catch (err) {
                    logger.error(`Failed to establish database connection: ${err.message}`);
                    return err;
                }
            }
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
            count: async (collection, ...args) => {
                const connection = await ensureConnection();
                if (connection === true) {
                    return await collection.count();
                } else {
                    logger.error(`Database not connected for count()`);
                    return new Error('Database not connected for count()');
                }
            },
            create: async (collection, ...args) => {
                const connection = await ensureConnection();
                if (connection === true) {
                    return await collection.create(...args);
                } else {
                    logger.error(`Database not connected for create()`);
                    return new Error('Database not connected for create()');
                }
            },
            deleteMany: async (collection, ...args) => {
                const connection = await ensureConnection();
                if (connection === true) {
                    return await collection.deleteMany(...args);
                } else {
                    logger.error(`Database not connected for deleteMany()`);
                    return new Error('Database not connected for deleteMany()');
                }
            },
            distinct: async (collection, ...args) => {
                const connection = await ensureConnection();
                if (connection === true) {
                    return await collection.distinct(...args);
                } else {
                    logger.error(`Database not connected for distinct()`);
                    return new Error('Database not connected for distinct()');
                }
            },
            join: async (collection, model, criteria, projection, options) => {
                const connection = await ensureConnection();
                if (connection === true) {
                    let project = { _id: 0 };
                    for (const p of projection) {
                        let [whole, prefix, field] = new RegExp('^(' + model + '.)?(.+)$').exec(p);
                        project[field] = prefix ? '$ref' + whole : 1;
                    }
                    return await collection.aggregate([
                        { $match: criteria },
                        { $limit: options.limit || 10000 },
                        { $lookup: lookupModels[model] },
                        { $unwind: '$ref' + model },
                        { $project: project },
                    ]);
                } else {
                    logger.error(`Database not connected for join()`);
                    return new Error('Database not connected for join()');
                }
            },
            find: async (collection, ...args) => {
                const connection = await ensureConnection();
                if (connection === true) {
                    return await collection.find(...args);
                } else {
                    logger.error(`Database not connected for find()`);
                    return new Error('Database not connected for find()');
                }
            },
            findById: async (collection, ...args) => {
                const connection = await ensureConnection();
                if (connection === true) {
                    return await collection.findById(...args);
                } else {
                    logger.error(`Database not connected for findById()`);
                    return new Error('Database not connected for findById()');
                }
            },
            findByIdAndRemove: async (collection, ...args) => {
                const connection = await ensureConnection();
                if (connection === true) {
                    return await collection.findByIdAndRemove(...args);
                } else {
                    logger.error(`Database not connected for findByIdAndRemove()`);
                    return new Error('Database not connected for findByIdAndRemove()');
                }
            },
            findOne: async (collection, ...args) => {
                const connection = await ensureConnection();
                if (connection === true) {
                    return await collection.findOne(...args);
                } else {
                    logger.error(`Database not connected for findOne()`);
                    return new Error('Database not connected for findOne()');
                }
            },
            findOneAndDelete: async (collection, ...args) => {
                const connection = await ensureConnection();
                if (connection === true) {
                    return await collection.findOneAndDelete(...args);
                } else {
                    logger.error(`Database not connected for findOneAndDelete()`);
                    return new Error('Database not connected for findOneAndDelete()');
                }
            },
            update: async (collection, ...args) => {
                const connection = await ensureConnection();
                if (connection === true) {
                    return await collection.update(...args);
                } else {
                    logger.error(`Database not connected for update()`);
                    return new Error('Database not connected for update()');
                }
            },
        };
    },
};
