module.exports = function (RED) {
    function ScheduleHolidaysConfigNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.values = config.values;
        this.events = config.events;
    }
    RED.nodes.registerType('ur_schedule_holidays_config', ScheduleHolidaysConfigNode);
};
