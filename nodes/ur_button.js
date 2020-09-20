module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function ButtonNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var group = RED.nodes.getNode(config.group);
        if (!group) {
            return;
        }
        var menuPage = RED.nodes.getNode(group.config.menuPage);
        if (!menuPage) {
            return;
        }
        var menuItem = RED.nodes.getNode(menuPage.config.menuItem);
        if (!menuItem) {
            return;
        }

        // menu-item tree stack (First In Last Out)
        var menuItems = [];
        menuItems.push(menuItem);
        while (menuItem.config.menuItem) {
            menuItem = RED.nodes.getNode(menuItem.config.menuItem);
            menuItems.push(menuItem);
        }

        var payloadType = config.payloadType;
        var payload = config.payload;

        if (payloadType === 'flow' || payloadType === 'global') {
            try {
                var parts = RED.util.normalisePropertyExpression(payload);
                if (parts.length === 0) {
                    throw new Error();
                }
            } catch (err) {
                node.warn('Invalid payload property expression - defaulting to node id');
                payload = node.id;
                payloadType = 'str';
            }
        } else {
            payload = payload || node.id;
        }

        var done = ui.add({
            node: node,
            menuItems: menuItems,
            menuPage: menuPage,
            group: group,
            emitOnlyNewValues: false,
            forwardInputMessages: config.passthru || false,
            storeFrontEndInputAsState: false,
            control: {
                type: 'button',
                label: config.label,
                tooltip: config.tooltip,
                color: config.color,
                bgcolor: config.bgcolor,
                icon: config.icon,
                order: config.order,
                value: payload,
                format: config.bgcolor,
                width: config.width || 3,
                // height: config.height || 1,
                access: config.access || '',
                accessBehavior: config.accessBehavior || 'disable'
            },
            beforeSend: function (msg) {
                msg.topic = config.topic || msg.topic;
            },
            convertBack: function (value) {
                if (payloadType === 'date') {
                    value = Date.now();
                } else {
                    value = RED.util.evaluateNodeProperty(payload, payloadType, node);
                }
                return value;
            },
        });
        node.on('close', done);
    }
    RED.nodes.registerType('ur_button', ButtonNode);
};
