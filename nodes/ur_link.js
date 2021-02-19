module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function LinkNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var folders = [];
        config.icon = 'ti-' + config.icon;

        var { folders, ...ignored } = ui.makeMenuTree(RED, config);

        var done = ui.addLink(config.id, config.name, folders, config.link, config.icon, config.order, config.target);

        node.on('close', done);
    }

    RED.nodes.registerType('ur_link', LinkNode);
};
