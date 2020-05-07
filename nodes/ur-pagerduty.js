const request = require('request');

module.exports = function(RED) {
    function PagerDutyNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        node.apikey = RED.nodes.getNode(config.apikey).apikey;

        node.on('input', function(msg, send, done) {
            let name = msg.payload && msg.payload.name ? msg.payload.name : node.name;
            let source = msg.payload && msg.payload.source ? msg.payload.source : config.source;
            let severity = msg.payload && msg.payload.severity ? msg.payload.severity : config.severity;
            let apikey = msg.payload && msg.payload.apikey ? msg.payload.apikey : node.apikey;

            if (apikey) {
                let payload = {
                    "routing_key": apikey,
                    "event_action": "trigger",
                    "dedup_key": source,
                    "payload": {
                        "summary": name,
                        "source": source,
                        "severity": severity,
                        "timestamp": null,
                        "component": null,
                        "group": null,
                        "class": null,
                        "custom_details": null
                    },
                    "images": null,
                    "links": null
                };

                let options = {
                    uri: 'https://events.pagerduty.com/v2/enqueue',
                    method: 'POST',
                    headers: { "Authorization" : "Token token=" + apikey },
                    json: true,
                    body: payload
                };

                request(options, (err, res, body) => {
                    if (err) {
                        msg.payload = err.toString() + " : pagerduty";
                        msg.statusCode = err.code;
                        send(msg);
                        done(err);
                    }
                    else {
                        msg.payload = body;
                        msg.statusCode = res.statusCode;
                        send(msg);
                        done();
                    }
                });
            }
        });
    }
    RED.nodes.registerType("ur-pagerduty", PagerDutyNode);
};