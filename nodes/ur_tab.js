module.exports = function (RED) {
    function TabNode(config) {
        RED.nodes.createNode(this, config);
        this.config = {
            name: config.name,
            order: config.order || 0,
            group: config.group,
            disabled: config.disabled || false,
            hidden: config.hidden || false,
        };
    }

    RED.nodes.registerType('ur_tab', TabNode);
};
