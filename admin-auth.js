/*
    Usage: To apply Unified user authentication to the Node-RED editor, 
    please set the following parameter in your Node-RED settings.js file:

    adminAuth: require("./node_modules/unified-red/admin-auth"),
*/

const http = require('http');
const https = require('https');

module.exports = {
    
    // Increased sessionExpiryTime to allow Node-RED session to extend beyond Unified-RED sessions.
    // Once a Node-RED session expires, the end-user will not be able to deploy schedules without
    // reauthenticating with Node-RED or logging in and out of Unified-RED.
    // TODO: Revoke Node-RED JWT token whenever Unified-RED JWT token expires.
    sessionExpiryTime: 365*86400, // expire Node-RED token after 1 year
    
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
                    res.setEncoding('utf8');
                    let rawData = '';
                    res.on('data', (chunk) => {
                        rawData += chunk;
                    });
                    res.on('end', () => {
                        try {
                            const user = JSON.parse(rawData);
                            /* Allow tech (9) and admin (10) level users access */
                            if (user.role == 9 || user.role == 10) {
                                // Succeessful login. Resolve with the user object
                                resolve({ username: username, permissions: '*' });
                            }
                            else {
                                // Resolve with null to indicate that the user does not have permissons to access the Node-RED Editor
                                resolve(null);
                            }
                        } catch (e) {
                            console.error(e.message);
                        }
                    });
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
