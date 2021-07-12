module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function AnimationNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var { tab, group, page, folders } = ui.makeMenuTree(RED, config);

        if (!config.width) {
            config.width = group.config.width;
        }
        var hei = Number(config.height || 0);

        this.config = {
            ...config,
            type: 'animation',
            order: config.order,
            width: config.width || 12,
            height: hei,
            format: config.format,
            rules: config.rules,
            topicPattern: config.topicPattern || '',
            access: config.access || '',
            accessBehavior: config.accessBehavior || 'disable',
        };

        var done = ui.add({
            emitOnlyNewValues: false,
            node: node,
            folders: folders,
            page: page,
            group: group,
            tab: tab,
            control: this.config,
            // control: {
            //     type: 'animation',
            //     order: config.order,
            //     width: config.width || 12,
            //     height: hei,
            //     format: config.format,
            //     rules: config.rules,
            //     topicPattern: config.topicPattern || '',
            //     access: config.access || '',
            //     accessBehavior: config.accessBehavior || 'disable',
            // },
        });
        node.on('close', done);
    }
    RED.nodes.registerType('ur_animation', AnimationNode);
    RED.library.register('ur_animation');
};
