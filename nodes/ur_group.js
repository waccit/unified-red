module.exports = function (RED) {
    function GroupNode(config) {
        RED.nodes.createNode(this, config);
        this.config = {
            name: config.name,
            disp: config.disp,
            // width: config.width || { lg: '6', md: '6', sm: '12' },
            widthLg: config.widthLg || '6',
            widthMd: config.widthMd || '6',
            widthSm: config.widthSm || '12',
            order: config.order || 0,
            page: config.page,
            collapse: config.collapse || false,
            disabled: config.disabled || false,
            hidden: config.hidden || false,
            access: config.access || '',
        };
        if (!this.config.hasOwnProperty('disp')) {
            this.config.disp = true;
        }
        if (this.config.disp !== false) {
            this.config.disp = true;
        }
        if (!this.config.hasOwnProperty('collapse')) {
            this.config.collapse = false;
        }
    }

    RED.nodes.registerType('ur_group', GroupNode);
};
