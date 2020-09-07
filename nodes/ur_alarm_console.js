module.exports = function (RED) {
    // var ui = require('../ui')(RED);
    const alarmService = require('../api/alarms/alarm.service');

    function AlarmConsoleNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;

        // var group = RED.nodes.getNode(config.group);
        // if (!group) {
        //     return;
        // }
        // var menuPage = RED.nodes.getNode(group.config.menuPage);
        // if (!menuPage) {
        //     return;
        // }
        // var menuItem = RED.nodes.getNode(menuPage.config.menuItem);
        // if (!menuItem) {
        //     return;
        // }

        // // menu-item tree stack (First In Last Out)
        // var menuItems = [];
        // menuItems.push(menuItem);
        // while (menuItem.config.menuItem) {
        //     menuItem = RED.nodes.getNode(menuItem.config.menuItem);
        //     menuItems.push(menuItem);
        // }

        // var done = ui.add({
        //     emitOnlyNewValues: false,
        //     node: node,
        //     menuItems: menuItems,
        //     menuPage: menuPage,
        //     group: group,
        //     control: {
        //         id: config.id,
        //         type: 'alarm_console',
        //         order: config.order,
        //         width: config.width || group.config.width || 12,
        //         // height: config.height || 1,
        //     }
        // });
        // node.on('close', done);

        node.on('input', function(msg) {
            if (msg.topic && msg.payload) {
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
            }
        });

    }
    RED.nodes.registerType('ur_alarm_console', AlarmConsoleNode);
};
