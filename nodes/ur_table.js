const { data } = require('jquery');

module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function TableNode(config) {
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
                }
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
