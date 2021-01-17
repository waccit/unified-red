const request = require('request');

module.exports = function (RED) {
    function PagerDutyNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        let configNode = RED.nodes.getNode(config.apikey);
        this.apikey = configNode ? configNode.apikey : null;
        this.inhibit = false;
        this.inhibitTimer = null;

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

        let requireField = function (obj, prop, defValue) {
            let field = obj && obj[prop] ? obj[prop] : defValue;
            if (!field) {
                node.status({ fill: 'red', shape: 'dot', text: 'Missing ' + prop });
                return;
            }
            return field;
        }

        this.on('input', function (msg) {
            if (checkInhibit(msg)) {
                return;
            }

            let name = requireField(msg.payload, 'name', node.name);
            let source = requireField(msg.payload, 'source', config.source);
            let severity = requireField(msg.payload, 'severity', config.severity);
            let apikey = requireField(msg.payload, 'apikey', node.apikey);

            if (!name || !source || !severity || !apikey) {
                return;
            }

            if (severity === 'alert') {
                severity = 'error';
            }

            let customDetails = [];
            if (msg.payload) {
                if (msg.payload.value) {
                    customDetails.push('Value: ' + msg.payload.value);
                }
                if (msg.payload.state) {
                    customDetails.push('State: ' + msg.payload.state);
                }
                if (msg.payload.ackreq) {
                    customDetails.push('Acknowledgement Required: ' + msg.payload.ackreq);
                }
            }
            customDetails = customDetails.length ? customDetails.join(', ') : null;

            if (apikey) {
                // https://developer.pagerduty.com/docs/events-api-v2/trigger-events/
                let payload = {
                    'routing_key': apikey, //Required
                    'event_action': 'trigger', //Required
                    'dedup_key': source,
                    'payload': {
                        'summary': name, //Required
                        'source': source, //Required
                        'severity': severity, //Required
                        'timestamp': null,
                        'component': null,
                        'group': null,
                        'class': null,
                        'custom_details': customDetails,
                    },
                    'images': null,
                    'links': null,
                };

                let options = {
                    uri: 'https://events.pagerduty.com/v2/enqueue',
                    method: 'POST',
                    headers: { 'Authorization': 'Token token=' + apikey },
                    json: true,
                    body: payload,
                };

                request(options, (err, res, body) => {
                    if (err) {
                        node.status({ fill: 'red', shape: 'dot', text: err.code + ': ' + err.toString() });
                    } else {
                        node.status({ fill: 'green', shape: 'dot', text: body });
                    }
                });
            }
        });
    }
    RED.nodes.registerType('ur_pagerduty', PagerDutyNode);
};
