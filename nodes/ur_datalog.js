module.exports = function (RED) {
    const datalogService = require('../api/datalogs/datalog.service');

    function DatalogNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;

        this.inhibit = false;
        this.inhibitTimer = null;

        let processMessage = function (msg) {
            try {
                let entry = { topic: msg.topic };
                let configure = false;

                // configuration properties
                if (typeof msg.newTopic === 'string') {
                    entry.newTopic = msg.newTopic;
                    configure = true;
                }
                if (typeof msg.maxDays === 'number') {
                    entry.maxDays = msg.maxDays;
                    configure = true;
                }
                if (typeof msg.units === 'string') {
                    entry.units = msg.units;
                    configure = true;
                }
                if (msg.hasOwnProperty('presets')) {
                    entry.presets = msg.presets;
                    configure = true;
                }
                if (Array.isArray(msg.tags)) {
                    entry.tags = msg.tags;
                    configure = true;
                }

                if (configure) {
                    datalogService.configureLogger(entry);
                } else {
                    // log properties
                    entry.value = msg.payload;
                    if (typeof msg.status === 'string') {
                        entry.status = msg.status;
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
