const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    level: { type: Number, unique: true, required: true },
    name: { type: String, unique: true, required: true },
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

module.exports = mongoose.model('Role', schema);
