module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function TextNode(config) {
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

        var layout = config.layout || 'row-spread';
        var angLayout = 'row';
        var angLayoutAlign = 'space-between center';
        if (layout === 'row-spread') {
            angLayout = 'row';
            angLayoutAlign = 'space-between center';
        } else if (layout === 'row-left') {
            angLayout = 'row';
            angLayoutAlign = 'start center';
        } else if (layout === 'row-center') {
            angLayout = 'row';
            angLayoutAlign = 'center center';
        } else if (layout === 'row-right') {
            angLayout = 'row';
            angLayoutAlign = 'end center';
        } else if (layout === 'col-center') {
            angLayout = 'column';
            angLayoutAlign = 'center center';
        }
        var done = ui.add({
            emitOnlyNewValues: false,
            node: node,
            menuItems: menuItems,
            menuPage: menuPage,
            group: group,
            control: {
                id: config.id,
                type: 'text',
                label: config.label,
                order: config.order,
                format: config.format,
                width: config.width || 12,
                instanceNum: config.instanceNum || '',
                instance: config.instance || {},
                // height: config.height || 1,
                layout: angLayout,
                layoutAlign: angLayoutAlign,
                topicPattern: config.topicPattern || '',
                access: config.access || '',
                accessBehavior: config.accessBehavior || 'disable',
            },
            convert: function (value) {
                if (value !== undefined) {
                    if (Buffer.isBuffer(value)) {
                        value = value.toString('binary');
                    } else {
                        value = value.toString();
                    }
                }
                return value;
            },
        });
        node.on('close', done);
    }
    RED.nodes.registerType('ur_text', TextNode);
};
