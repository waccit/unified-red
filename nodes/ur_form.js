module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function FormNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var group = RED.nodes.getNode(config.group);
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
            forwardInputMessages: false,
            control: {
                type: 'form',
                label: config.label,
                order: config.order,
                value: config.payload || node.id,
                width: config.width || 12,
                // height: config.height || config.options.length,
                options: config.options,
                formValue: config.formValue,
                submit: config.submit,
                cancel: config.cancel,
                topicPattern: config.topicPattern || '',
                access: config.access || '',
                accessBehavior: config.accessBehavior || 'disable',
            },
            beforeEmit: function (msg) {
                return msg;
            },
            beforeSend: function (msg, fromUI) {
                if (fromUI && fromUI.hasOwnProperty('msg') && fromUI.msg !== null) {
                    var om = fromUI.msg;
                    om.socketid = fromUI.socketid;
                    om.topic = fromUI.msg.topic;
                    return om;
                }
            },
        });
        node.on('close', done);
    }
    RED.nodes.registerType('ur_form', FormNode);
};
