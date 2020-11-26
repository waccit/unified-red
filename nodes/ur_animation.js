module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function AnimationNode(config) {
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

        if (!config.width) {
            config.width = group.config.width;
        }
        var hei = Number(config.height || 0);

        var done = ui.add({
            emitOnlyNewValues: false,
            node: node,
            folders: folders,
            page: page,
            group: group,
            tab: tab,
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
            }
        });
        node.on('close', done);
    }
    RED.nodes.registerType('ur_animation', AnimationNode);
    RED.library.register('ur_animation');
};
