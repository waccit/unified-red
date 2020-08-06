module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function TextInputNode(config) {
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

        var done = ui.add({
            node: node,
            menuItem: menuItem,
            menuPage: menuPage,
            group: group,
            forwardInputMessages: config.passthru,
            control: {
                type: config.delay <= 0 ? 'text-input-CR' : 'text-input',
                label: config.label,
                tooltip: config.tooltip,
                mode: config.mode,
                delay: config.delay,
                order: config.order,
                value: '',
                width: config.width || 12,
                // height: config.height || 1,
            },
            beforeSend: function (msg) {
                if (config.mode === 'time') {
                    if (typeof msg.payload === 'string') {
                        msg.payload = Date.parse(msg.payload);
                    }
                }
                // if (config.mode === "week") { msg.payload = Date.parse(msg.payload); }
                // if (config.mode === "month") { msg.payload = Date.parse(msg.payload); }
                msg.topic = config.topic || msg.topic;
            },
        });
        node.on('close', done);
    }
    RED.nodes.registerType('ur_text_input', TextInputNode);
};
