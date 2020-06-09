/*
Credit to Jason Watmore (https://github.com/cornflourblue) for user management API example.
Source: https://github.com/cornflourblue/node-mongo-registration-login-api
*/

const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const emailService = require('../email.service');
const User = db.User;
var _settings;
const Role = require('./role.model');

module.exports = {
    authenticate,
    canRegister,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    generateResetToken,
    resetPassword,
};

async function authenticate({ username, password }) {
    const user = await User.findOne({ username });
    checkValidUser(user);
    if (user && bcrypt.compareSync(password, user.hash)) {
        const token = jwt.sign({ sub: user.id, role: user.role }, config.jwtsecret);
        return {
            ...user.toJSON(),
            token,
        };
    }
}

async function canRegister() {
    // allow registration when no users exist
    return (await User.countDocuments()) === 0;
}

async function getAll() {
    return await User.find();
}

async function getById(id) {
    return await User.findById(id);
}

async function create(userParam) {
    let level = userParam.role;
    userParam.role = Role[level];
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }
    validateEmailAddress(userParam.email);

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        checkStrongPassword(userParam.password);
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
    return user;
}

async function update(id, userParam) {
    const user = await User.findById(id);
    let level = userParam.role;
    userParam.role = Role[level];

    if (!user) {
        throw 'User not found';
    }
    if (user.username !== userParam.username && (await User.findOne({ username: userParam.username }))) {
        throw 'Username "' + userParam.username + '" is already taken';
    }
    // validate email address if it was entered
    if (userParam.email) {
        validateEmailAddress(userParam.email);
    }

    // hash password if it was entered
    if (userParam.password) {
        checkStrongPassword(userParam.password);
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
    return user;
}

async function _delete(id) {
    if ((await User.countDocuments()) === 1) {
        throw 'Unable to delete last user';
    }
    const user = await User.findById(id);
    if (!user) {
        throw 'User not found';
    }
    await User.findByIdAndRemove(id);
}

async function generateResetToken(req, username) {
    // TODO: decouple from http (req)
    const user = await User.findOne({ 'username': username });
    checkValidUser(user);

    // generate reset token and save in user
    let token = uuidv4();
    await update(user.id, { resetToken: token });

    // build email message
    let rootPath = '/ui';
    if (typeof settings().ui !== 'undefined' && typeof settings().ui.path !== 'undefined') {
        rootPath = settings().ui.path.length ? '/' + settings().ui.path : '';
    }
    let resetLink = req.protocol + '://' + req.get('host') + rootPath + '/#/authentication/reset-password/' + token;
    let message =
        "A password reset has been request for username '" +
        user.username +
        "'. Please click this link to change your password: " +
        resetLink;

    await emailService.send(user.email, 'Password Reset for ' + user.username, message);
    return token;
}

async function resetPassword(token, { password }) {
    // TODO: need web page to handle new password input
    // validate token and find user
    if (!token) throw 'Invalid or expired reset token';
    const user = await User.findOne({ 'resetToken': token });
    if (!user) throw 'Invalid or expired reset token';

    // update user password
    return await update(user.id, { password: password, resetToken: null });
}

function checkValidUser(user) {
    if (!user) {
        throw 'User not found';
    }
    if (!user.enabled) {
        throw 'Disabled user account';
    }
    if (user.expirationDate && user.expirationDate.getTime() < new Date().getTime()) {
        throw 'User account has expired';
    }
}

function validateEmailAddress(email) {
    if (!email || !/^([^@]+)@([^\.]+)\.[a-z]+$/.test(email)) {
        throw 'Invalid email address';
    }
}

function checkStrongPassword(password) {
    /*
     * Password Regular Expression Pattern:
     * Source: http://www.mkyong.com/regular-expressions/how-to-validate-password-with-regular-expression/
     */
    let minPasswordLength = 8;
    let passwordPattern =
        '(' /* Start of group */ +
        '(?=.*[a-z])' /* must contains one lowercase characters */ +
        '(?=.*[A-Z])' /* must contains one uppercase characters */ +
        /* must contains one digit or symbol in the list "`~!@#$%^&*()-_=+[]{}\/|;:'\",.<>?" */
        '(?=.*[0-9`~\\!@#\\$%\\^&\\*\\(\\)\\-_\\=\\+\\[\\]\\{\\}\\\\/\\|;:\'",\\.\\<\\>\\?])' +
        '.' /* match anything with previous condition checking */ +
        '{' +
        minPasswordLength +
        ',}' /* length at least 8 characters */ +
        ')'; /* End of group */

    if (!new RegExp(passwordPattern).test(password)) {
        throw 'Weak password. Password must have a minimum of 8 characters containing a lowercase character, a uppercase character, and a digit or symbol.';
    }
}

function settings() {
    if (!_settings) {
        try {
            _settings = require(process.env.RED_SETTINGS_FILE);
        } catch (e) {
            return {};
        }
    }
    return _settings;
}
