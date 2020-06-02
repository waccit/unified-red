/*
Credit to Jason Watmore (https://github.com/cornflourblue) for user management API example.
Source: https://github.com/cornflourblue/node-mongo-registration-login-api
*/

module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    if (typeof err === 'string') {
        // custom application error
        return res.status(400).json({ message: err });
    }

    if (err.name === 'ValidationError') {
        // mongoose validation error
        return res.status(400).json({ message: err.message });
    }

    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        return res.status(401).json({ message: 'Invalid Token' });
    }

    if (err.message) {
        switch (err.message) {
            case 'User not found':
            case 'Disabled user account':
            case 'User account has expired':
                return res.status(401).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }

    // default to 500 server error
    return res.status(500).json({ message: 'Unknown error' });
}
