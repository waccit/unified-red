const fs = require('fs');
const path = require('path');
const configFilePath = path.resolve(__dirname + '/../config.json');
const config = require(configFilePath);
const db = require('../db');
const emailService = require('../email.service');
let settings;
let log;

module.exports = {
    init,
    isInstalled,
    isDbConnected,
    install,
    testDbConnection,
    testSmtpServer,
};

function init(_log, _settings) {
    log = _log;
    settings = _settings;
}

async function isInstalled() {
    if (
        settings &&
        settings.adminAuth &&
        settings.httpStatic &&
        config &&
        config.mongoConnection &&
        config.jwtsecret &&
        config.smtp.host
    ) {
        return true;
    }
    return false;
}

async function isDbConnected() {
    return db.status() === 'connected';
}

async function install(setup) {
    // Since install API is not protected (i.e. it's a public API), installation should only be allowed once.
    // After install, block further install changes
    if (await isInstalled()) {
        return { result: false, message: 'Already installed' };
    }
    try {
        // Add settings to config.json file
        if (setup.mongoConnection || setup.jwtsecret || setup.smtp) {
            if (setup.mongoConnection) {
                config.mongoConnection = setup.mongoConnection;
            }
            if (setup.jwtsecret) {
                config.jwtsecret = setup.jwtsecret;
            }
            if (setup.smtp) {
                config.smtp = setup.smtp;
            }
            log.info('Unified-RED applying settings to config.json');
            fs.writeFileSync(configFilePath, JSON.stringify(config, null, 4));
        }

        // Add settings to Node-RED settings file
        let data = fs.readFileSync(settings.settingsFile, { encoding: 'utf8' });
        if (!settings.adminAuth) {
            log.info('Self-installing Unified-RED adminAuth hook on ' + settings.settingsFile);
            let defaultAdminAuthPath = path.resolve(__dirname + '/../../admin-auth');
            let adminAuthPath = setup.adminAuthPath || defaultAdminAuthPath;
            data = data.replace(
                /(\/\/[\s]*)?(adminAuth[\s]*\:.*\n)/i,
                'adminAuth: require("' + adminAuthPath + '"),\n// $2'
            );
        }
        if (!settings.httpStatic) {
            log.info('Self-installing Unified-RED static folder path on ' + settings.settingsFile);
            let defaultStaticPath = path.resolve(__dirname + '/../../static/');
            let staticPath = setup.staticPath || defaultStaticPath;
            data = data.replace(/(\/\/[\s]*)?(httpStatic[\s]*\:.*\n)/i, 'httpStatic: "' + staticPath + '",\n// $2');
        }
        fs.writeFileSync(settings.settingsFile, data, { encoding: 'utf8' });

        let successStr = 'Installation complete. Shutting down Node-RED in 5 seconds...';
        log.info(successStr);
        setTimeout(function () {
            process.exit();
        }, 5000);
        return { result: true, message: successStr };
    } catch (e) {
        log.info('--- Unified-RED installation error:');
        log.info(e);
        log.info('---');
        return { result: false, message: e.message };
    }
}

async function testDbConnection(mongoConnection) {
    try {
        await db.test(mongoConnection);
        return { result: true };
    } catch (error) {
        return { result: false, error: error.message };
    }
}

async function testSmtpServer(smtp) {
    try {
        let r = await emailService.test(smtp.host, smtp.port, smtp.ssl, smtp.fromAddress, smtp.user, smtp.password);
        return { result: true };
    } catch (error) {
        return { result: false, error: error.message };
    }
}
