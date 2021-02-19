module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function LinkNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var folders = [];
        config.icon = 'ti-' + config.icon;

        // console.log('node: ', node);
        // console.log('config: ', config);

        var { folders, ...ignored } = ui.makeMenuTree(RED, config);
        // console.log('ignored: ', ignored);
        // console.log('folders: ', folders);

        // if (config.folder) {
        //     folder = RED.nodes.getNode(config.folder);
        //     console.log('folder: ', folder);
        // }

        var done = ui.addLink(config.id, config.name, folders, config.link, config.icon, config.order, config.target);

        node.on('close', done);
    }

    RED.nodes.registerType('ur_link', LinkNode);
};
