const db = require('../db');
const socketio = require('../../socket');
const Datalog = db.Datalog;
const Logger = db.Logger;

module.exports = {
    query,
    list,
    log,
    getLogger,
    configureLogger,
    deleteLogger,
};

function maxLimit(l) {
    return l ? parseInt(l) : 10000;
}

async function list() {
    return await db.distinct(Logger, 'topic');
}

async function getLogger(topic) {
    const logger = await db.findOne(Logger, { topic: topic }, 'topic units tags');
    if (!logger) {
        throw 'Logger not found';
    }
    return logger;
}

async function createLogger(param) {
    let logger = await db.findOne(Logger, { topic: param.topic });
    if (logger) {
        return logger;
    }
    if (!param.maxDays || param.maxDays < 1) {
        param.maxDays = 1;
    }
    logger = new Logger(param);
    await logger.save();
    return logger;
}

async function configureLogger(param) {
    const logger = await createLogger(param);
    if (param.newTopic) {
        param.topic = param.newTopic;
        delete param.newTopic;
    }
    if (param.hasOwnProperty('maxDays') && param.maxDays < 1) {
        param.maxDays = 1;
    }
    Object.assign(logger, param);
    await logger.save();
    return logger;
}

async function deleteLogger(topic) {
    const logger = await db.findOneAndDelete(Logger, { topic: topic });
    if (logger) {
        db.deleteMany(Datalog, { logger: logger._id });
    }
}

function log(param) {
    createLogger(param).then((logger) => {
        let datalog = new Datalog(param);
        datalog.logger = logger._id;
        datalog.expires = new Date(Date.now() + Math.max(logger.maxDays, 1) * 86400000);
        datalog.save();
        socketio.connection().emit('ur-datalog-update', {
            'action': 'log',
            'payload': {
                topic: logger.topic,
                units: logger.units,
                tags: logger.tags,
                timestamp: datalog.timestamp,
                value: datalog.value,
                status: datalog.status,
            },
        });
    });
}

/*
queryParam = {
    topic: string or string[],
    startTimestamp: Date,
    endTimestamp: Date,
    value: any,
    lowValue: any,
    highValue: any,
    status: string,
    tags: string[]
}

query returns:
[
    {
        "topic": "some/sensor/a",
        "timestamp": "2020-09-24T23:23:06.107Z",
        "value": 9.983341664682815,
        "units": "%",
        "tags": ["temp"],
        "status": "normal",
    },
    ...
]
*/

async function query(param) {
    let criteria = [];
    if (param.topic) {
        if (Array.isArray(param.topic)) {
            const loggers = await db.find(Logger, { 'topic': { '$in': param.topic } });
            criteria.push({ logger: { '$in': loggers.map(logger => logger._id) } });
        } else {
            const logger = await db.findOne(Logger, { 'topic': param.topic });
            criteria.push({ logger: logger._id });
        }
    }
    if (param.startTimestamp) {
        let startDate = new Date(param.startTimestamp);
        criteria.push({ timestamp: { '$gte': startDate } });
    }
    if (param.endTimestamp) {
        let endDate = new Date(param.endTimestamp);
        criteria.push({ timestamp: { '$lte': endDate } });
    }
    if (param.value) {
        criteria.push({ value: param.value });
    } else {
        if (param.lowValue) {
            criteria.push({ value: { '$gte': param.lowValue } });
        }
        if (param.highValue) {
            criteria.push({ value: { '$lte': param.highValue } });
        }
    }
    if (param.status) {
        criteria.push({ status: param.status });
    }
    if (param.tags) {
        if (!Array.isArray(param.tags)) {
            param.tags = [param.tags];
        }
        criteria.push({ tags: { '$in': param.tags } });
    }

    if (criteria.length === 1) {
        criteria = criteria[0];
    } else if (criteria.length > 1) {
        criteria = { '$and': criteria };
    } else {
        criteria = {};
    }

    let options = { 
        limit: maxLimit(param.limit),
    };
    if (param.sort) {
        options.sort = {};
        options.sort[param.sort] = param.sortDir || -1;
    }
    let projection = [ 'timestamp', 'value', 'status', 'Logger.topic', 'Logger.units', 'Logger.tags' ];
    return db.join(Datalog, 'Logger', criteria, projection, options);
}
