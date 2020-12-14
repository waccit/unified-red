module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function FormNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var { tab, group, page, folders } = ui.makeMenuTree(RED, config);

        var done = ui.add({
            node: node,
            folders: folders,
            page: page,
            group: group,
            tab: tab,
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
            beforeSend: function (msg, fromUI) {
                if (fromUI && fromUI.msg) {
                    var om = fromUI.msg;
                    om.socketid = fromUI.socketid;
                    return om;
                }
            },
        });
        node.on('close', done);
    }
    RED.nodes.registerType('ur_form', FormNode);
};
