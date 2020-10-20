module.exports = function (RED) {
    var ui = require('../ui')(RED);
    var ChartIdList = {};

    function ChartNode(config) {
        RED.nodes.createNode(this, config);
        this.chartType = config.chartType || 'line';
        var node = this;

        var group = RED.nodes.getNode(config.group);
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

        var dnow = Date.now();
        var options = {
            emitOnlyNewValues: true,
            node: node,
            folders: folders,
            page: page,
            group: group,
            control: {
                type: 'chart',
                look: node.chartType,
                order: config.order,
                label: config.label,
                legend: config.legend || false,
                interpolate: config.interpolate,
                nodata: config.nodata,
                width: parseInt(config.width || group.config.width || 6),
                height: parseInt(config.height || group.config.width / 2 + 1 || 4),
                xrange: config.xrange,
                xrangeunits: config.xrangeunits,
                ymin: config.ymin,
                ymax: config.ymax,
                topics: config.topics,
                live: config.live || false,
                xformat: config.xformat || 'HH:mm:ss',
                cutout: parseInt(config.cutout || 0),
                colors: config.colors,
                useOneColor: config.useOneColor || false,
                animation: false,
                spanGaps: false,
                options: {},
                topicPattern: config.topicPattern || '',
                access: config.access || '',
                accessBehavior: config.accessBehavior || 'disable',
            },
        };

        var chgtab = function () {
            node.receive({ payload: 'R' });
        };
        ui.ev.on('changetab', chgtab);

        var done = ui.add(options);

        var st = setTimeout(function () {
            node.emit('input', { payload: 'start' }); // trigger a redraw at start to flush out old data.
            if (node.wires.length === 2) {
                // if it's an old version of the node honour it
                node.send([null, { payload: 'restore', for: node.id }]);
            }
        }, 100);

        node.on('close', function () {
            if (st) {
                clearTimeout(st);
            }
            ui.ev.removeListener('changetab', chgtab);
            done();
        });
    }
    RED.nodes.registerType('ur_chart', ChartNode);
};
