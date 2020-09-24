const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    topic: { type: String, required: true, index: true },
	units: { type: String },
	presets: { type: Map, of: String },
    tags: { type: [String] },
    maxDays: { type: Number, required: true }
});

schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    },
});

module.exports = mongoose.model('Logger', schema);