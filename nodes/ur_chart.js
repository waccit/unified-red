module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function ChartNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var { tab, group, page, folders } = ui.makeMenuTree(RED, config);

        var done = ui.add({
            emitOnlyNewValues: true,
            node: node,
            folders: folders,
            page: page,
            group: group,
            tab: tab,
            control: {
                type: 'chart',
                chartType: config.chartType || 'line',
                order: config.order,
                label: config.label,
                legend: !!config.legend,
                timeline: !!config.timeline,
                curve: config.curve,
                width: parseInt(config.width || group.config.width) || 12,
                height: parseInt(config.height || group.config.width / 2 + 1) || 6,
                xrange: config.xrange,
                xrangeunits: config.xrangeunits,
                ymin: config.ymin,
                ymax: config.ymax,
                topics: config.topics,
                live: !!config.live,
                colors: config.colors,
                referenceLines: config.referenceLines,
                showRefLines: !!config.showRefLines,
                topicPattern: config.topicPattern || '',
                access: config.access || '',
                accessBehavior: config.accessBehavior || 'disable',
            },
        });

        node.on('close', function () {
            done();
        });
    }
    RED.nodes.registerType('ur_chart', ChartNode);
};
