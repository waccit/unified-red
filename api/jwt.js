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
    // revoke token if user no longer exists
    if (!user) {
        return done(null, true);
    }

    done();
}
