const version = require('./package.json').version;
const { URL } = require('url');

let heartbeatInterval = null;
let uid = getUID();

function postJson(urlString, body, callback) {
    const url = new URL(urlString);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? require('https') : require('http');
    const data = JSON.stringify(body);
    const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
        },
    };
    const req = lib.request(options, (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
            let parsed;
            try {
                parsed = raw ? JSON.parse(raw) : null;
            } catch (_) {
                parsed = null;
            }
            callback(null, res, parsed);
        });
    });
    req.on('error', (err) => callback(err, null, null));
    req.write(data);
    req.end();
}

function start(site) {
    if (heartbeatInterval) {
        stop();
    }
    heartbeatInterval = setInterval(function () {
        try {
            postJson(
                site.monitorServer,
                {
                    uid: uid,
                    version: version,
                    name: site.name || '',
                    address: site.address || '',
                    contactName: site.contactName || '',
                    contactEmail: site.contactEmail || '',
                },
                (err, res, body) => {}
            );
        } catch (e) {}
    }, 24 * 3600000 /*  24 hrs */);
}

function stop() {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
}

function getUID() {
    const uidFile = 'unified-red-uid';
    const fs = require('fs');

    // if unique id was previously generated, then retrieve and return it
    try {
        let uid = fs.readFileSync(uidFile, 'utf8');
        if (/[0-9a-fA-F]{64}/.test(uid)) {
            return uid;
        }
    } catch (e) {}

    // otherwise collect all active mac addresses, hash, and store as unique machine ID
    const networkInterfaces = require('os').networkInterfaces();
    let macs = [];
    for (let adapter in networkInterfaces) {
        let networkInterface = networkInterfaces[adapter];
        let m = networkInterface.filter((i) => i.mac !== '00:00:00:00:00:00').map((i) => i.mac);
        macs = macs.concat(m);
    }
    const macStr = macs.join(',');
    const uid = require('crypto').createHash('sha256').update(macStr).digest('hex');
    try {
        fs.writeFile(uidFile, uid, function (err) {
            if (err) {
                console.log(err);
            }
        });
    } catch (e) {
        console.log(e);
    }
    return uid;
}

module.exports = {
    start: start,
    stop: stop,
};
