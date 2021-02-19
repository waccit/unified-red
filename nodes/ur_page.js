module.exports = function (RED) {
    function PageNode(config) {
        RED.nodes.createNode(this, config);
        this.config = {
            pathName: config.name.replace(/ /g, '').toLowerCase(),
            // pathName: encodeURIComponent(config.name.replace(/ /g, '').toLowerCase()),
            name: config.name,
            disp: config.disp,
            width: config.width,
            order: config.order || 0,
            folder: config.folder,
            collapse: config.collapse || false,
            // icon: config.icon || 'ti-folder',
            disabled: config.disabled || false,
            hidden: config.hidden || false,
            isMulti: config.isMulti || false,
            expression: config.expression || '',
            instances: this.instances || config.instances || [],
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

    RED.nodes.registerType('ur_page', PageNode);
};
