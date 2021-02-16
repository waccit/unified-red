module.exports = function (RED) {
    const datalogService = require('../api/datalogs/datalog.service');

    function DatalogNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;

        this.format = config.format || "msg.payload.value";
        this.maxDays = isNaN(config.maxDays) ? null : Math.max(parseInt(config.maxDays, 10), 1);
        this.inhibit = false;
        this.inhibitTimer = null;

        let configCache = {};
        let configCOV = function(msg, prop, value) {
            if (typeof value === 'undefined') {
                value = msg.payload[prop];
            }
            if (typeof value !== 'undefined') {
                if (!configCache[msg.topic] || configCache[msg.topic][prop] !== value) {
                    if (!configCache[msg.topic]) {
                        configCache[msg.topic] = {};
                    }
                    configCache[msg.topic][prop] = value;
                    return true;
                }
            }
            return false;
        };

        let processMessage = function (msg) {
            try {
                let entry = { topic: msg.topic };
                let configure = false;

                // configuration properties
                let maxDays = parseInt(msg.payload.maxDays || config.maxDays, 10);
                if (configCOV(msg, 'maxDays', maxDays)) {
                    entry.maxDays = maxDays;
                    configure = true;
                }
                if (configCOV(msg, 'units')) {
                    entry.units = msg.payload.units;
                    configure = true;
                }
                if (Array.isArray(msg.payload.tags) && configCOV(msg, 'tags')) {
                    entry.tags = msg.payload.tags;
                    configure = true;
                }
                if (typeof msg.payload.newTopic === 'string' && msg.topic !== msg.payload.newTopic) {
                    entry.newTopic = msg.payload.newTopic;
                    configure = true;
                    // map config cache entry to new topic
                    configCache[msg.payload.newTopic] = configCache[msg.topic];
                    delete configCache[msg.topic];
                }

                if (configure) {
                    datalogService.configureLogger(entry);
                }

                entry.value = RED.util.evaluateNodeProperty(node.format, 'msg', node, msg);
                if (typeof entry.value !== 'undefined') {
                    if (typeof entry.value === 'string' && !isNaN(entry.value)) {
                        entry.value = parseFloat(entry.value);
                    }
                    if (typeof msg.payload.health === 'string') {
                        entry.health = msg.payload.health;
                    }
                    datalogService.log(entry);
                }
                node.status({});
            } catch (err) {
                node.status({ fill: 'red', shape: 'dot', text: err });
                node.error(err);
            }
        };

        let pendingMessages = [];
        let handlingMessage = false;
        let processMessageQueue = function (msg) {
            if (msg) {
                // A new message has arrived - add it to the message queue
                pendingMessages.push(msg);
                if (handlingMessage) {
                    // The node is currently processing a message, so do nothing more with this message
                    return;
                }
            }
            if (pendingMessages.length === 0) {
                // There are no more messages to process, clear the active flag and return
                handlingMessage = false;
                return;
            }

            // There are more messages to process. Get the next message and start processing it. Recurse back in to check for any more
            let nextMsg = pendingMessages.shift();
            handlingMessage = true;
            try {
                processMessage(nextMsg);
            } catch (err) {
                node.error(err, nextMsg);
            }
            processMessageQueue();
        };

        let checkInhibit = function (msg) {
            if (msg.hasOwnProperty('inhibit')) {
                try {
                    let inhibit = msg.inhibit.toString().toLowerCase().trim();
                    if (inhibit === '0' || inhibit === 'false') {
                        node.inhibit = false;
                        node.status({});
                        clearTimeout(node.inhibitTimer);
                        node.inhibitTimer = null;
                    } else if (inhibit === 'true') {
                        node.inhibit = true;
                        node.status({ fill: 'grey', shape: 'dot', text: 'inhibited' });
                        clearTimeout(node.inhibitTimer);
                        node.inhibitTimer = null;
                    } else if (!isNaN(inhibit)) {
                        inhibit = parseInt(inhibit);
                        if (inhibit > 0) {
                            node.inhibit = true;
                            let d = new Date();
                            d.setSeconds(d.getSeconds() + inhibit);
                            node.status({ fill: 'grey', shape: 'dot', text: 'inhibited until ' + d.toLocaleString() });
                            node.inhibitTimer = setTimeout(() => {
                                // clear inhibit after timer elapses
                                node.inhibit = false;
                                node.status({});
                            }, inhibit * 1000);
                        }
                    }
                } catch (e) {
                    node.warn(e);
                }
            }
            return node.inhibit;
        };

        this.on('input', function (msg) {
            if (checkInhibit(msg)) {
                return;
            }
            if (msg.hasOwnProperty('topic') && msg.hasOwnProperty('payload')) {
                processMessageQueue(msg);
            }
        });
    }

    RED.nodes.registerType('ur_datalog', DatalogNode);
};
