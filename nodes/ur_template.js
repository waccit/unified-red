module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function TemplateNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var { tab, group, page, folders } = ui.makeMenuTree(RED, config);

        if (config.templateScope !== 'global') {
            if (!config.width) {
                config.width = group.config.width;
            }
        }
        var hei = Number(config.height || 0);

        var done = ui.add({
            forwardInputMessages: config.fwdInMessages,
            storeFrontEndInputAsState: config.storeOutMessages,
            persistentFrontEndValue: config.resendOnRefresh,
            emitOnlyNewValues: false,
            node: node,
            folders: folders,
            page: page,
            group: group,
            tab: tab,
            control: {
                type: 'template',
                order: config.order,
                width: config.width || 12,
                height: hei,
                format: config.format,
                templateScope: config.templateScope,
                topicPattern: config.topicPattern || '',
                access: config.access || '',
                accessBehavior: config.accessBehavior || 'disable',
            },
            beforeSend: function (msg, fromUI) {
                if (fromUI && fromUI.msg) {
                    var om = fromUI.msg;
                    om.socketid = fromUI.socketid;
                    return om;
                }
            },
        });
        node.on('close', done);
    }
    RED.nodes.registerType('ur_template', TemplateNode);
    RED.library.register('uitemplates');
};
