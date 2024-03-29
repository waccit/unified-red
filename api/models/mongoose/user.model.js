/*
Credit to Jason Watmore (https://github.com/cornflourblue) for user management API example.
Source: https://github.com/cornflourblue/node-mongo-registration-login-api
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    username: { type: String, unique: true, required: true },
    hash: { type: String, required: true },
    role: { type: Number, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    enabled: { type: Boolean, default: true, required: true },
    createdDate: { type: Date, default: Date.now },
    expirationDate: { type: Date },
    resetToken: { type: String },
    sessionExpiration: { type: Number },
    sessionInactivity: { type: Number },
    homepage: { type: String },
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
        delete ret.hash;
        delete ret.resetToken;
    },
});

module.exports = mongoose.model('User', schema);
