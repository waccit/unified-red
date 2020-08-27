module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function TableNode(config) {
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

        try {
            var done = ui.add({
                emitOnlyNewValues: false,
                node: node,
                menuItems: menuItems,
                menuPage: menuPage,
                group: group,
                control: {
                    id: config.id,
                    type: 'table',
                    width: config.width || 12,
                    label: config.label,
                    order: config.order,
                    fields: config.fields,
                    pivot: config.cts,
                },
                beforeEmit: function (msg, value) {
                    return {msg: {
                        payload: value, 
                        topic: msg.topic,
                        ur_control: (msg.hasOwnProperty("ur_control")) ? msg.ur_control : undefined,
                    }};
                },
                beforeSend: function (msg, orig) {
                    if (orig) { return orig.msg; }
                },
                
            });
        }
        catch (e) { console.log(e); }

        node.on('close', function () {
            if (done) { done(); }
        });
    }

    RED.nodes.registerType('ur_table', TableNode);
};