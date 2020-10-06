const config = require('./config.json');
const nodemailer = require('nodemailer');

module.exports = {
    send,
    test
};

// setup email server
let transporter = nodemailer.createTransport({
    host: config.smtp.host, // TODO: make all smtp settings web based
    port: config.smtp.port,
    secure: config.smtp.ssl, // true for 465, false for other ports
    auth: { user: config.smtp.user, pass: config.smtp.password },
    tls: { rejectUnauthorized: false }, // do not fail on invalid certs
});

function send(to, subject, message) {
    return transporter.sendMail({
        from: config.smtp.fromAddress,
        to: to,
        subject: subject,
        text: message,
        html: message,
    });
}

function test(host, port, ssl, fromAddress, user, password) {
    let tran = nodemailer.createTransport({
        host: host,
        port: port,
        secure: ssl,
        auth: { user: user, pass: password },
        tls: { rejectUnauthorized: false }, // do not fail on invalid certs
    });
    return tran.sendMail({
        from: fromAddress,
        to: 'none@none.com'
    });
}