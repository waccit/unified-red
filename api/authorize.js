/*
Credit to Jason Watmore (https://github.com/cornflourblue) for user management API example.
Source: https://github.com/cornflourblue/node-mongo-registration-login-api
*/

const expressJwt = require('express-jwt');
const config = require('./config.json');
const userService = require('./users/user.service');

module.exports = authorize;

function authorize(role) {
    const secret = config.jwtsecret;
    return [
        // authenticate JWT token
        expressJwt({ secret, isRevoked }),

        // authorize based on user role
        (req, res, next) => {
            if (role && req.user.role >= role) {
                return res.status(401).json({ message: 'Unauthorized' }); // user's role is not authorized
            }
            // authentication and authorization successful
            next();
        },
    ];
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
