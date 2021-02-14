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
const socketio = require('../../socket');
const User = db.User;
const Role = require('./role.model');
var _settings;

module.exports = {
    authenticate,
    canRegister,
    register,
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    generateResetToken,
    resetPassword,
};

async function authenticate({ username, password }) {
    const user = await db.findOne(User, { username });
    checkValidUser(user);
    if (user && bcrypt.compareSync(password, user.hash)) {
        let payload = { sub: user._id, role: user.role };
        // Add expiration date if user is configured for session expiry
        if (user.sessionExpiration) {
            let today = parseInt(Date.now() / 1000);
            payload.exp = today + user.sessionExpiration * 86400; // expire in X days: # of days * seconds per day
        }
        const token = jwt.sign(payload, config.jwtsecret);
        return {
            ...user.toJSON(),
            token,
        };
    }
}

async function canRegister() {
    // allow registration when no users exist
    return !(await db.findOne(User));
}

async function getAll() {
    return await db.find(User);
}

async function getById(id) {
    return await db.findById(User, id);
}

async function register(userParam) {
    if (await canRegister()) {
        userParam.role = Role.Level10; // Make first user to an admin
        return create(userParam);
    }
    throw 'Cannot register';
}

async function create(userParam) {
    // validate
    if (await db.findOne(User, { username: userParam.username })) {
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
    const user = await db.findById(User, id);

    if (!user) {
        throw 'User not found';
    }
    if (userParam.username && user.username !== userParam.username && (await db.findOne(User, { username: userParam.username }))) {
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

    socketio.connection().emit('ur-user-update', user);
    return user;
}

async function _delete(id) {
    if (await db.count(User) === 1) {
        throw 'Unable to delete last user';
    }
    const user = await db.findById(User, id);
    if (!user) {
        throw 'User not found';
    }
    await db.findByIdAndRemove(User, id);
}

async function generateResetToken(req, username) {
    // TODO: decouple from http (req)
    const user = await db.findOne(User, { 'username': username });
    checkValidUser(user);

    // generate reset token and save in user
    let token = uuidv4();
    await update(user._id, { resetToken: token });

    // build email message
    let rootPath = '/';
    // let rootPath = '/ui';
    if (typeof settings().ui !== 'undefined' && typeof settings().ui.path !== 'undefined' && settings().ui.path !== '/') {
        rootPath = settings().ui.path.length ? '/' + settings().ui.path : '';
    }
    let resetLink = req.protocol + '://' + req.get('host') + rootPath + '#/authentication/reset-password/' + token;
    let message =
        "A password reset has been requested for username '" +
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
    const user = await db.findOne(User, { 'resetToken': token });
    if (!user) throw 'Invalid or expired reset token';

    // update user password
    return await update(user._id, { password: password, resetToken: null });
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
