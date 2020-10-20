/*
    Usage: To apply Unified user authentication to the Node-RED editor, 
    please set the following parameter in your Node-RED settings.js file:

    adminAuth: require("./node_modules/unified-red/admin-auth"),
*/

const http = require('http');
const https = require('https');

module.exports = {
    sessionExpiryTime: 86400, // expire token after 1 day
    type: 'credentials',
    users: function (username) {
        return new Promise(function (resolve) {
            // Do not validate username. Pass-thru to authenticate() for full validation.
            resolve({ username: username, permissions: '*' });
        });
    },
    authenticate: function (username, password) {
        return new Promise(function (resolve) {
            // Validate the username/password via Unified API
            const data = JSON.stringify({ 'username': username, 'password': password });
            const options = {
                hostname: 'localhost',
                port: 1880,
                path: '/api/users/authenticate',
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
            };
            const req = http.request(options, (res) => {
                if (res.statusCode === 200) {
                    // Successful login. Resolve with the user object
                    resolve({ username: username, permissions: '*' });
                } else {
                    // Resolve with null to indicate the username/password pair were not valid.
                    resolve(null);
                }
            });
            req.on('error', (error) => {
                console.error(error);
                resolve(null);
            });
            req.write(data);
            req.end();
        });
    },
};
