module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function ButtonNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var tab = RED.nodes.getNode(config.tab);
        if (!tab) {
            return;
        }
        var group = RED.nodes.getNode(tab.config.group);
        if (!group) {
            return;
        }
        var page = RED.nodes.getNode(group.config.page);
        if (!page) {
            return;
        }
        var folder = RED.nodes.getNode(page.config.folder);
        if (!folder) {
            return;
        }

        // folder tree stack (First In Last Out)
        var folders = [];
        folders.push(folder);
        while (folder.config.folder) {
            folder = RED.nodes.getNode(folder.config.folder);
            folders.push(folder);
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
            folders: folders,
            page: page,
            group: group,
            tab: tab,
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
                topicPattern: config.topicPattern || '',
                access: config.access || '',
                accessBehavior: config.accessBehavior || 'disable',
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
