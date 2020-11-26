module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function TextInputNode(config) {
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

        var done = ui.add({
            node: node,
            folders: folders,
            page: page,
            group: group,
            tab: tab,
            forwardInputMessages: config.passthru,
            control: {
                type: 'text-input',
                label: config.label,
                tooltip: config.tooltip,
                mode: config.mode,
                delay: config.delay,
                order: config.order,
                value: '',
                width: config.width || 12,
                // height: config.height || 1,
                topicPattern: config.topicPattern || '',
                access: config.access || '',
                accessBehavior: config.accessBehavior || 'disable',
            },
            beforeSend: function (msg, fromUI) {
                if (fromUI && fromUI.msg) {
                    var om = fromUI.msg;
                    om.socketid = fromUI.socketid;
                    om.topic = config.topic || msg.topic;
                    return om;
                }
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
