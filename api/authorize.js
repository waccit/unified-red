/*
Credit to Jason Watmore (https://github.com/cornflourblue) for user management API example.
Source: https://github.com/cornflourblue/node-mongo-registration-login-api
*/

const { expressjwt } = require('express-jwt');
const config = require('./config.json');
const userService = require('./users/user.service');

module.exports = authorize;

function authorize(role) {
    const secret = config.jwtsecret;
    return [
        // authenticate JWT token
        expressjwt({ secret, algorithms: ['HS256'], isRevoked }),

        // authorize based on user role
        (req, res, next) => {
            if (role && req.auth.role >= role) {
                return res.status(401).json({ message: 'Unauthorized' }); // user's role is not authorized
            }
            // authentication and authorization successful
            next();
        },
    ];
}

async function isRevoked(req, token) {
    const user = await userService.getById(token.payload.sub);
    // revoke token if user no longer exists, is disabled, or is expired
    if (!user) {
        return true;
    }
    if (!user.enabled) {
        return true;
    }
    if (user.expirationDate && user.expirationDate.getTime() < new Date().getTime()) {
        return true;
    }
    return false;
}
