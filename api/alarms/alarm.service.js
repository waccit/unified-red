const db = require('../db');
const socketio = require("../../socket").connection();
const Alarm = db.Alarm;

module.exports = {
    getAll,
    getSummary,
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
    return await Alarm.find({}, null, { sort: { "timestamp": -1 }, limit: maxLimit(limit) });
}

async function getSummary(limit) {
    return await Alarm.mapReduce({
        map: function() {
            emit(this.topic, {
                severity: this.severity,
                name: this.name,
                topic: this.topic,
                value: this.value,
                state: this.state,
                ackreq: this.ackreq,
                timestamp: this.timestamp,
                acktime: this.acktime || 0,
                unackActive: this.state && !this.acktime ? 1 : 0
            });
        },
        reduce: function(k, v) {
            return v.reduce((prev, curr, index, array) => {
                    var latest = curr.timestamp >= prev.timestamp ? curr : prev;
                    latest.unackActive = prev.unackActive + curr.unackActive;
                    return latest;
                }
            );
        },
        finalize: function(k, v) {
            if (v.acktime === 0) {
                delete v.acktime;
            }
            return v;
        },
        limit: maxLimit(limit)
    });
}

async function getRecent(state, limit) {
    return await Alarm.find({ "state" : !!state }, null, { sort: { "timestamp": -1 }, limit: maxLimit(limit) });
}

async function getById(id) {
    return await Alarm.findById(id);
}

async function getByTopic(topic, limit) {
    return await Alarm.find({ "topic" : topic }, null, { sort: { "timestamp": -1 }, limit: maxLimit(limit) });
}

async function create(alarmParam) {
    let prevAlarm = await Alarm.findOne({ "topic" : alarmParam.topic }, null, { sort: { "timestamp": -1 }});
    if (prevAlarm && prevAlarm.severity === alarmParam.severity && prevAlarm.state === alarmParam.state) {
        throw 'Duplicate alarm for ' + alarmParam.topic;
    }
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
    query["$or"] = [ { "acktime" : { "$exists": false } }, { "acktime": 0 } ];
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

