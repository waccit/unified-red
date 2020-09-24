const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    timestamp: { type: Date, default: Date.now, required: true },
    topic: { type: String, required: true },
    value: { type: Object, required: true },
    status: { type: String },
    expires: { type: Date, required: true },
});

schema.index({ expires: 1 }, { expireAfterSeconds: 0 });

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.expires;
    },
});

module.exports = mongoose.model('Datalog', schema);