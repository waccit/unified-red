module.exports = function (RED) {
    const alarmService = require('../api/alarms/alarm.service');

    function AlarmConsoleNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        this.topic = config.topic;
        this.topicType = config.topicType || "json";
        let severityFilter = {
            "critical": config.severitycritical,
            "alert": config.severityalert,
            "warning": config.severitywarning,
            "info": config.severityinfo,
            "failover": false
        };

        let buildTopicFilter = function(msg) {
            let topicFilter = RED.util.evaluateNodeProperty(node.topic, node.topicType, node, msg);
            if (!Array.isArray(topicFilter)) {
                topicFilter = [ topicFilter ];
            }
            topicFilter = topicFilter.map(f => 
                '(^' +                             //topic start
                    f.replace(/\+/g, '[^\/]+')     //handle MQTT '+' operator to handle single level wildcards
                     .replace(/#/g, '.*')          //handle MQTT '#' operator to handle multiple level wildcards
                     .replace(/\//g, '\\/') +      //escape all '/'
                '$)')                              //topic end
                .join('|');                        //logical OR with other expressions
            topicFilter = new RegExp(topicFilter, 'i');
            return topicFilter;
        };

        let filterOnTopic = !!node.topic;
        let topicFilter;
        if (filterOnTopic && (node.topicType === "str" || node.topicType === "json")) {
            topicFilter = buildTopicFilter();
        }

        node.on('input', function(msg) {
            if (!msg.topic || !msg.payload || // invalid message object
                !severityFilter[msg.payload.severity || "failover"]) { // filter severity
                return;
            }

            // if using msg, flow, or global variables then build the topic filter each time since these are not static values
            if (node.topicType === "msg" || node.topicType === "flow" || node.topicType === "global") {
                topicFilter = buildTopicFilter(msg);
            }
            if (filterOnTopic && !topicFilter.test(msg.topic)) { // filter topic
                return;
            }

            if (msg.payload.action == "ack") {
                if (msg.payload.id) {
                    alarmService.ackById(msg.payload.id).catch(node.error);
                } else {
                    alarmService.ackByTopic(msg.topic).catch(node.error);
                }
            } else {
                let alarm = {
                    "severity": msg.payload.severity,
                    "name": msg.payload.name,
                    "topic": msg.topic,
                    "value": msg.payload.value,
                    "state": msg.payload.state,
                    "ackreq": !!msg.payload.ackreq,
                };
                alarmService.create(alarm).catch(node.error); 
            }
        });
    }
    RED.nodes.registerType('ur_alarm_console', AlarmConsoleNode);
};
