module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function GaugeNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var { tab, group, page, folders } = ui.makeMenuTree(RED, config);

        this.config = {
            ...config,
            type: 'gauge',
            name: config.name,
            label: config.label,
            topics: config.topics,
            order: config.order,
            value: config.min,
            legend: config.legend,
            showAxis: config.showAxis,
            format: config.format,
            units: config.units,
            gtype: config.gtype || 'gauge',
            min: parseFloat(config.min) < parseFloat(config.max) ? parseFloat(config.min) : parseFloat(config.max),
            max: parseFloat(config.min) < parseFloat(config.max) ? parseFloat(config.max) : parseFloat(config.min),
            reverse: parseFloat(config.max) < parseFloat(config.min) ? true : false,
            bigseg: config.bigseg,
            smallseg: config.smallseg,
            hideMinMax: config.hideMinMax,
            width: parseInt(config.width || group.config.width) || 12,
            height: parseInt(config.height || group.config.width / 2 + 1) || 6,
            colors: config.colors,
            options: null,
            topicPattern: config.topicPattern || '',
            access: config.access || '',
            accessBehavior: config.accessBehavior || 'disable',
        };

        var done = ui.add({
            node: node,
            folders: folders,
            page: page,
            group: group,
            tab: tab,
            emitOnlyNewValues: false,
            control: this.config,
            // control: {
            //     type: 'gauge',
            //     name: config.name,
            //     label: config.label,
            //     topics: config.topics,
            //     order: config.order,
            //     value: config.min,
            //     legend: config.legend,
            //     showAxis: config.showAxis,
            //     format: config.format,
            //     units: config.units,
            //     gtype: config.gtype || 'gauge',
            //     min: parseFloat(config.min) < parseFloat(config.max) ? parseFloat(config.min) : parseFloat(config.max),
            //     max: parseFloat(config.min) < parseFloat(config.max) ? parseFloat(config.max) : parseFloat(config.min),
            //     reverse: parseFloat(config.max) < parseFloat(config.min) ? true : false,
            //     bigseg: config.bigseg,
            //     smallseg: config.smallseg,
            //     hideMinMax: config.hideMinMax,
            //     width: parseInt(config.width || group.config.width) || 12,
            //     height: parseInt(config.height || group.config.width / 2 + 1) || 6,
            //     colors: config.colors,
            //     options: null,
            //     topicPattern: config.topicPattern || '',
            //     access: config.access || '',
            //     accessBehavior: config.accessBehavior || 'disable',
            // },
        });
        node.on('close', done);
    }
    RED.nodes.registerType('ur_gauge', GaugeNode);
};
