const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    severity: { type: String, required: true },
    name: { type: String, required: true },
    topic: { type: String, required: true },
    value: { type: String, required: true },
    state: { type: Boolean, required: true },
    acktime: { type: Date },
    ackreq: { type: Boolean },
    timestamp: { type: Date, default: Date.now },
}, {
    writeConcern: {
        w: 1,
        j: true,
        wtimeout: 1000
    }
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    },
});

module.exports = mongoose.model('Alarm', schema);
