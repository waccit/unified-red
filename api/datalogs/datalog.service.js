const db = require('../db');
const socketio = require('../../socket').connection();
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
    return await Logger.distinct('topic');
}

async function getLogger(topic) {
    const logger = await Logger.findOne({ topic: topic }, 'topic units presets tags capacity');
    if (!logger) {
        throw 'Logger not found';
    }
    return logger;
}

async function createLogger(param) {
    let logger = await Logger.findOne({ topic: param.topic });
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

function deleteLogger(topic) {
    const logger = Logger.findOneAndDelete({ topic: topic });
    if (logger) {
        Datalog.deleteMany({ logger: logger._id });
    }
}

function log(param) {
    createLogger(param).then((logger) => {
        let datalog = new Datalog(param);
        datalog.logger = logger._id;
        datalog.expires = new Date(Date.now() + Math.max(logger.maxDays, 1) * 86400000);
        datalog.save();
        let presetValue = '';
        for (let preset in logger.presets) {
            if (logger.presets[preset] + '' === datalog.value + '') {
                presetValue = preset;
                break;
            }
        }
        socketio.emit('ur-datalog-update', {
            'action': 'log',
            'payload': {
                topic: logger.topic,
                units: logger.units,
                tags: logger.tags,
                timestamp: datalog.timestamp,
                value: datalog.value,
                presetValue: presetValue,
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
        "presetValue": "some preset",
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
            const loggerIds = await Logger.find({ 'topic': { '$in': loggerIds } }).map((l) => l._id);
            criteria.push({ logger: { '$in': loggerIds } });
        } else {
            const logger = await Logger.findOne({ 'topic': param.topic });
            criteria.push({ logger: logger._id });
        }
    }
    if (param.startTimestamp) {
        criteria.push({ timestamp: { '$gte': param.startTimestamp } });
    }
    if (param.endTimestamp) {
        criteria.push({ timestamp: { '$lte': param.endTimestamp } });
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

    const operators = [
        { $match: criteria },
        { $limit: maxLimit(param.limit) },
        { $lookup: { from: 'loggers', localField: 'logger', foreignField: '_id', as: 'loggerObj' } },
        { $unwind: '$loggerObj' },
        {
            $project: {
                _id: 0,
                timestamp: 1,
                value: 1,
                status: 1,
                topic: '$loggerObj.topic',
                units: '$loggerObj.units',
                presetValue: {
                    /*
                    Map value to preset if a matching preset exists:
                    1. Convert preset object to array of objects, e.g. {'on':'1', 'off':'0'} -> [{k:'on', v:'1'}, {k:'off', v:'0'}]
                    2. Filter object array where value equals preset value, e.g. if value is 1, result is [{k:'on', v:'1'}]
                    3. Map the array to keys (k properties) only, e.g. result is ['on']
                    4. Return the 0th element in the array, e.g. 'on'
                    */
                    $arrayElemAt: [
                        {
                            $map: {
                                input: {
                                    $filter: {
                                        input: { $objectToArray: '$loggerObj.presets' },
                                        cond: { $eq: [{ $toString: '$$this.v' }, { $toString: '$value' }] },
                                    },
                                },
                                in: '$$this.k',
                            },
                        },
                        0,
                    ],
                },
            },
        },
    ];

    if (param.sort) {
        let sort = {};
        sort[param.sort] = param.sortDir || -1;
        operators.push({ $sort: sort });
    }

    return await Datalog.aggregate(operators);
}
