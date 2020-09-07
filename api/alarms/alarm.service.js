const db = require('../db');
const socketio = require("../../socket").connection();
const Alarm = db.Alarm;

module.exports = {
    getAll,
    getById,
    create,
    update,
    ackById,
    ackByTopic,
    delete: _delete
};

async function getAll() {
    return await Alarm.find();
}

async function getById(id) {
    return await Alarm.findById(id);
}

async function create(alarmParam) {
    const alarm = new Alarm(alarmParam);
    await alarm.save();
    socketio.emit('ur-alarm-update', { "action": "create", "payload": alarm });
    return alarm;
}

async function update(id, alarmParam) {
    const alarm = await Alarm.findById(id);
    if (!alarm) {
        throw 'Alarm not found';
    }
    Object.assign(alarm, alarmParam);
    await alarm.save();
    socketio.emit('ur-alarm-update', { "action": "update", "payload": alarm });
    return alarm;
}

async function _ack(query) {
    let alarms = await Alarm.find(query);
    if (!alarms) {
        throw 'Alarm(s) not found';
    }
    for (let alarm of alarms) {
        alarm.acktime = Date.now();
        await alarm.save();
        socketio.emit('ur-alarm-update', { "action": "update", "payload": alarm });
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
    const alarm = await Alarm.findById(id);
    if (!alarm) {
        throw 'Alarm not found';
    }
    await Alarm.findByIdAndRemove(id);
    socketio.emit('ur-alarm-update', { "action": "delete", "payload": alarm });
}

