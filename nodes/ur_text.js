module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function TextNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var { tab, group, page, folders } = ui.makeMenuTree(RED, config);

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

        this.config = {
            ...config,
            id: config.id,
            type: 'text',
            label: config.label,
            order: config.order,
            format: config.format,
            width: config.width || 12,
            // height: config.height || 1,
            layout: angLayout,
            layoutAlign: angLayoutAlign,
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
            //     id: config.id,
            //     type: 'text',
            //     label: config.label,
            //     order: config.order,
            //     format: config.format,
            //     width: config.width || 12,
            //     // height: config.height || 1,
            //     layout: angLayout,
            //     layoutAlign: angLayoutAlign,
            //     topicPattern: config.topicPattern || '',
            //     access: config.access || '',
            //     accessBehavior: config.accessBehavior || 'disable',
            // },
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
