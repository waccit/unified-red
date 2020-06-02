/*
Credit to Jason Watmore (https://github.com/cornflourblue) for user management API example.
Source: https://github.com/cornflourblue/node-mongo-registration-login-api
*/

const expressJwt = require('express-jwt');
const config = require('./config.json');
const userService = require('./users/user.service');

module.exports = jwt;

function jwt() {
    const secret = config.jwtsecret;
    return expressJwt({ secret, isRevoked }).unless({
        path: [
            // public routes that don't require authentication
            '/api/users/authenticate',
            '/api/users/register',
            /\/api\/users\/forgot\/.+/i,
            /\/api\/users\/reset\/.+/i,
        ],
    });
}

async function isRevoked(req, payload, done) {
    const user = await userService.getById(payload.sub);
    // revoke token if user no longer exists, is disabled, or is expired
    if (!user) {
        return done(new Error('User not found'), true);
    }
    if (!user.enabled) {
        return done(new Error('Disabled user account'), true);
    }
    if (user.expirationDate && user.expirationDate.getTime() < new Date().getTime()) {
        return done(new Error('User account has expired'), true);
    }
    done();
}
