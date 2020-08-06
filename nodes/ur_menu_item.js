module.exports = function (RED) {
    function MenuItemNode(config) {
        RED.nodes.createNode(this, config);
        this.config = {
            pathName: config.name.replace(' ', '').toLowerCase(),
            name: config.name,
            menuItem: config.menuItem,
            order: config.order || 0,
            icon: 'menu-icon ti-' + (config.icon || 'dashboard'),
            disabled: config.disabled || false,
            hidden: config.hidden || false,
        };
    }

    RED.nodes.registerType('ur_menu_item', MenuItemNode);
};
