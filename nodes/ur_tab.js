module.exports = function (RED) {
    function TabNode(config) {
        RED.nodes.createNode(this, config);
        this.config = {
            pathName: config.name.replace(' ', '').toLowerCase(),
            name: config.name,
            order: config.order || 0,
            icon: 'menu-icon ti-' + (config.icon || 'dashboard'),
            disabled: config.disabled || false,
            hidden: config.hidden || false,
        };
    }

    RED.nodes.registerType('ur_tab', TabNode);
};
