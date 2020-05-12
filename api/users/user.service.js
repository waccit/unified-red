/*
Credit to Jason Watmore (https://github.com/cornflourblue) for user management API example.
Source: https://github.com/cornflourblue/node-mongo-registration-login-api
*/

const config = require('../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const User = db.User;

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ username, password }) {
    const user = await User.findOne({ username });
    checkValidUser(user);
    if (user && bcrypt.compareSync(password, user.hash)) {
        const token = jwt.sign({ sub: user.id }, config.secret);
        return {
            ...user.toJSON(),
            token
        };
    }
}

async function getAll() {
    return await User.find();
}

async function getById(id) {
    return await User.findById(id);
}

async function create(userParam) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        checkStrongPassword(userParam.password);
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    checkValidUser(user);
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        checkStrongPassword(userParam.password);
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}


function checkValidUser(user) {
    if (!user) {
        throw "User not found";
    }
    if (!user.enabled) {
        throw "Disabled user account";
    }
    if (user.expirationDate && user.expirationDate.getTime() < new Date().getTime()) {
        throw "User account has expired";
    }
}

function checkStrongPassword(password) {
    /*
     * Password Regular Expression Pattern: 
     * Source: http://www.mkyong.com/regular-expressions/how-to-validate-password-with-regular-expression/
     */
    let minPasswordLength = 8;
    let passwordPattern = "(" /* Start of group */
        + "(?=.*[a-z])" /* must contains one lowercase characters */
        + "(?=.*[A-Z])" /* must contains one uppercase characters */
        /* must contains one digit or symbol in the list "`~!@#$%^&*()-_=+[]{}\/|;:'\",.<>?" */
        + "(?=.*[0-9`~\\!@#\\$%\\^&\\*\\(\\)\\-_\\=\\+\\[\\]\\{\\}\\\\/\\|;:'\",\\.\\<\\>\\?])"
        + "." /* match anything with previous condition checking */
        + "{" + minPasswordLength + ",}" /* length at least 8 characters */
        + ")"; /* End of group */

    if (!new RegExp(passwordPattern).test(password)) {
        throw "Weak password. Password must have a minimum of 8 characters containing a lowercase character, a uppercase character, and a digit or symbol.";
    }
}
