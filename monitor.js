const request = require('request');
const version = require('./package.json').version;

let heartbeatInterval = null;
let uid = getUID();

function start(site) {
    if (heartbeatInterval) {
        stop();
    }
    heartbeatInterval = setInterval(function () {
        try {
            request(
                {
                    uri: site.monitorServer,
                    method: 'POST',
                    json: true,
                    body: {
                        uid: uid,
                        version: version,
                        name: site.name || '',
                        address: site.address || '',
                        contactName: site.contactName || '',
                        contactEmail: site.contactEmail || '',
                    },
                },
                (err, res, body) => {}
            );
        } catch (e) {}
    }, 24*3600000 /*  24 hrs */);
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

    // otherwse collect all active mac addresses, hash, and store as unique machine ID
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
