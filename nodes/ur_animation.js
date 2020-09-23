module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function AnimationNode(config) {
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

        if (!config.width) {
            config.width = group.config.width;
        }
        var hei = Number(config.height || 0);
        var previousTemplate = null;

        var done = ui.add({
            emitOnlyNewValues: false,
            node: node,
            menuItems: menuItems,
            menuPage: menuPage,
            group: group,
            control: {
                type: 'animation',
                order: config.order,
                width: config.width || 12,
                height: hei,
                format: config.format,
                rules: config.rules,
                topicPattern: config.topicPattern || '',
                access: config.access || '',
                accessBehavior: config.accessBehavior || 'disable',
            },
            beforeEmit: function (msg) {
                var properties = Object.getOwnPropertyNames(msg).filter(function (p) {
                    return p[0] != '_';
                });
                var clonedMsg = {};
                for (var i = 0; i < properties.length; i++) {
                    var property = properties[i];
                    clonedMsg[property] = msg[property];
                }

                // transform to string if msg.template is buffer
                if (clonedMsg.template !== undefined && Buffer.isBuffer(clonedMsg.template)) {
                    clonedMsg.template = clonedMsg.template.toString();
                }

                if (clonedMsg.template === undefined && previousTemplate !== null) {
                    clonedMsg.template = previousTemplate;
                }

                //This updates the whole page if the template input changes and
                //height set to auto - performance killer, but here just in case
                // if ((config.height == "0") && (value !== node.oldvalue)) {
                //     node.oldvalue = value;
                //     setImmediate(function() { ui.updateUi(); });
                // }

                if (clonedMsg.template) {
                    previousTemplate = clonedMsg.template;
                }

                return { msg: clonedMsg };
            },
            beforeSend: function (msg, original) {
                if (original && original.hasOwnProperty('msg') && original.msg !== null) {
                    var om = original.msg;
                    om.socketid = original.socketid;
                    return om;
                }
            },
        });
        node.on('close', done);
    }
    RED.nodes.registerType('ur_animation', AnimationNode);
    RED.library.register('ur_animation');
};
