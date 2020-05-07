module.exports = function(RED) {
    function PagerDutyConfigNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.apikey = config.apikey;
    }
    RED.nodes.registerType("ur-pagerduty-config", PagerDutyConfigNode);
};