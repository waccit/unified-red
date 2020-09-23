module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function FormNode(config) {
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

        var done = ui.add({
            node: node,
            menuItems: menuItems,
            menuPage: menuPage,
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
