module.exports = function(RED) {

    function SubtabNode(config) {
        RED.nodes.createNode(this, config);
        this.config = {
            name: config.name,
            disp: config.disp,
            width: config.width,
            order: config.order || 0,
            tab: config.tab,
            collapse: config.collapse || false,
            icon: config.icon || '',
            disabled: config.disabled || false,
            hidden: config.hidden || false
        };
        if (!this.config.hasOwnProperty("disp")) { this.config.disp = true; }
        if (this.config.disp !== false) { this.config.disp = true; }
        if (!this.config.hasOwnProperty("collapse")) { this.config.collapse = false; }
    }

    RED.nodes.registerType("ur_subtab", SubtabNode);
};