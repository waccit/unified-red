const { data } = require('jquery');

module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function TableNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var { tab, group, page, folders } = ui.makeMenuTree(RED, config);

        try {
            var done = ui.add({
                emitOnlyNewValues: false,
                node: node,
                folders: folders,
                page: page,
                group: group,
                tab: tab,
                control: {
                    id: config.id,
                    type: 'table',
                    width: config.width || 12,
                    label: config.label,
                    order: config.order,
                    fields: config.fields,
                    pivot: config.cts,
                    topicPattern: config.topicPattern || '',
                    access: config.access || '',
                    accessBehavior: config.accessBehavior || 'disable',
                },
            });
        } catch (e) {
            console.log(e);
        }

        node.on('close', function () {
            if (done) {
                done();
            }
        });
    }

    RED.nodes.registerType('ur_table', TableNode);
};
