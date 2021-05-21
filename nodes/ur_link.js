module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function LinkNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var folders = [];
        var { folders, ...ignored } = ui.makeMenuTree(RED, config);

        // var done = ui.addLink(config.id, config.name, folders, config.link, config.icon, config.order, config.target);
        var done = ui.addLink(folders, {
            id: config.id,
            name: config.name,
            icon: 'ti-' + config.icon,
            link: config.link,
            order: config.order,
            target: config.target,
            disabled: config.disabled || false,
            hidden: config.hidden || false,
        });

        node.on('close', done);
    }

    RED.nodes.registerType('ur_link', LinkNode);
};
