const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    topic: { type: String, unique: true, required: true, index: true },
    units: { type: String },
    tags: { type: [String] },
    maxDays: { type: Number, required: true },
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
        delete ret.id;
    },
});

module.exports = mongoose.model('Logger', schema);
