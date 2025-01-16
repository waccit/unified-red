const db = require('../db');
const socketio = require('../../socket');
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
    delete: _delete,
};

function maxLimit(l) {
    return l ? parseInt(l) : 10000;
}

async function getAll(limit) {
    try {
        return await db.find(Alarm, {}, null, { sort: { 'timestamp': -1 }, limit: maxLimit(limit) });
    } catch (err) {
        console.error('alarm.service.js / getAll():', err);
    }
}

async function getRecent(state, limit) {
    try {
        return await db.find(Alarm, { 'state': !!state }, null, { sort: { 'timestamp': -1 }, limit: maxLimit(limit) });
    } catch (err) {
        console.error('alarm.service.js / getRecent():', err);
    }
}

async function getById(id) {
    try {
        return await db.findById(Alarm, id);
    } catch (err) {
        console.error('alarm.service.js / getById():', err);
    }
}

async function getByTopic(topic, limit) {
    try {
        return await db.find(Alarm, { 'topic': topic }, null, { sort: { 'timestamp': -1 }, limit: maxLimit(limit) });
    } catch (err) {
        console.error('alarm.service.js / getByTopic():', err);
    }
}

async function create(alarmParam) {
    try {
        let prevAlarm = await db.findOne(Alarm, { 'topic': alarmParam.topic }, null, { sort: { 'timestamp': -1 } });
        if (prevAlarm && prevAlarm.severity === alarmParam.severity && prevAlarm.state === alarmParam.state) {
            throw 'Duplicate alarm for ' + alarmParam.topic;
        }
        const alarm = new Alarm(alarmParam);
        await alarm.save();
        socketio.connection().emit('ur-alarm-update', { 'action': 'create', 'payload': alarm });
        return alarm;
    } catch (err) {
        console.error('alarm.service.js / create():', err);
    }
}

async function update(id, alarmParam) {
    try {
        const alarm = await db.findById(Alarm, id);
        if (!alarm) {
            throw 'Alarm not found';
        }
        Object.assign(alarm, alarmParam);
        await alarm.save();
        socketio.connection().emit('ur-alarm-update', { 'action': 'update', 'payload': alarm });
        return alarm;
    } catch (err) {
        console.error('alarm.service.js / update():', err);
    }
}

async function _ack(query) {
    query[db.chooseOperator('$or')] = [{ 'acktime': null }, { 'acktime': 0 }];
    try {
        let alarms = await db.find(Alarm, query);
        if (!alarms) {
            throw 'Alarm(s) not found';
        }
        for (let alarm of alarms) {
            alarm.acktime = Date.now();
            await alarm.save();
            socketio.connection().emit('ur-alarm-update', { 'action': 'update', 'payload': alarm });
        }
        return alarms;
    } catch (err) {
        console.error('alarm.service.js / _ack():', err);
    }
}

async function ackById(id) {
    return _ack({ '_id': id });
}

async function ackByTopic(topic) {
    return _ack({ 'topic': topic });
}

async function _delete(id) {
    try {
        const alarm = await db.findById(Alarm, id);
        if (!alarm) {
            throw 'Alarm not found';
        }
        await db.findByIdAndRemove(Alarm, id);
        socketio.connection().emit('ur-alarm-update', { 'action': 'delete', 'payload': alarm });
    } catch (err) {
        console.error('alarm.service.js / _delete():', err);
    }
}
