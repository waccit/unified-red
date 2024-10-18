const db = require('../db');
const socketio = require("../../socket");
const Alarm = db.Alarm;

module.exports = {
    getAll,
    getRecent,
    getById,
    getByTopic,
    create,
    update,
    ackById,
    ackByTopic,
    delete: _delete
};

function maxLimit(l) {
    return l ? parseInt(l) : 10000;
}

async function getAll(limit) {
    return await db.find(Alarm, {}, null, { sort: { "timestamp": -1 }, limit: maxLimit(limit) });
}

async function getRecent(state, limit) {
    return await db.find(Alarm, { "state" : !!state }, null, { sort: { "timestamp": -1 }, limit: maxLimit(limit) });
}

async function getById(id) {
    return await db.findById(Alarm, id);
}

async function getByTopic(topic, limit) {
    return await db.find(Alarm, { "topic" : topic }, null, { sort: { "timestamp": -1 }, limit: maxLimit(limit) });
}

async function create(alarmParam) {
    let prevAlarm = await db.findOne(Alarm, { "topic" : alarmParam.topic }, null, { sort: { "timestamp": -1 }});
    if (prevAlarm && prevAlarm.severity === alarmParam.severity && prevAlarm.state === alarmParam.state) {
        throw 'Duplicate alarm for ' + alarmParam.topic;
    }
    const alarm = new Alarm(alarmParam);
    await alarm.save();
    socketio.connection().emit('ur-alarm-update', { "action": "create", "payload": alarm });
    return alarm;
}

async function update(id, alarmParam) {
    const alarm = await db.findById(Alarm, id);
    if (!alarm) {
        throw 'Alarm not found';
    }
    Object.assign(alarm, alarmParam);
    await alarm.save();
    socketio.connection().emit('ur-alarm-update', { "action": "update", "payload": alarm });
    return alarm;
}

async function _ack(query) {    
    query[db.chooseOperator("$or")] = [ { "acktime": null }, { "acktime": 0 } ];
    let alarms = await db.find(Alarm, query);
    if (!alarms) {
        throw 'Alarm(s) not found';
    }
    for (let alarm of alarms) {
        alarm.acktime = Date.now();
        await alarm.save();
        socketio.connection().emit('ur-alarm-update', { "action": "update", "payload": alarm });
    }
    return alarms;
}

async function ackById(id) {
    return _ack({ "_id" : id });
}

async function ackByTopic(topic) {
    return _ack({ "topic" : topic });
}

async function _delete(id) {
    const alarm = await db.findById(Alarm, id);
    if (!alarm) {
        throw 'Alarm not found';
    }
    await db.findByIdAndRemove(Alarm, id);
    socketio.connection().emit('ur-alarm-update', { "action": "delete", "payload": alarm });
}

