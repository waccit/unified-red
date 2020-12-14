module.exports = function (RED) {
    function FolderNode(config) {
        RED.nodes.createNode(this, config);
        this.config = {
            pathName: config.name.replace(/ /g, '').toLowerCase(),
            // pathName: encodeURIComponent(config.name.replace(/ /g, '').toLowerCase()),
            name: config.name,
            folder: config.folder,
            order: config.order || 0,
            icon: 'menu-icon ti-' + (config.icon || 'dashboard'),
            disabled: config.disabled || false,
            hidden: config.hidden || false,
        };
    }

    RED.nodes.registerType('ur_folder', FolderNode);
};
