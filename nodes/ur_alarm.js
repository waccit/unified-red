/**
Modeled after Node-RED's Switch core node.
 **/

module.exports = function(RED) {

    let severities = [ "critical", "alert", "warning", "info" ];
    let operators = {
        'eq': function(a, b) { return a == b; },
        'neq': function(a, b) { return a != b; },
        'lt': function(a, b) { return a < b; },
        'lte': function(a, b) { return a <= b; },
        'gt': function(a, b) { return a > b; },
        'gte': function(a, b) { return a >= b; },
        'btwn': function(a, b, c) { return (a >= b && a <= c) || (a <= b && a >= c); },
        'cont': function(a, b) { return (a + "").indexOf(b) != -1; },
        'regex': function(a, b, c, d) { return (a + "").match(new RegExp(b,d?'i':'')); },
        'true': function(a) { return a === true; },
        'false': function(a) { return a === false; },
        'null': function(a) { return (typeof a == "undefined" || a === null); },
        'nnull': function(a) { return (typeof a != "undefined" && a !== null); },
        'empty': function(a) {
            if (typeof a === 'string' || Array.isArray(a) || Buffer.isBuffer(a)) {
                return a.length === 0;
            } else if (typeof a === 'object' && a !== null) {
                return Object.keys(a).length === 0;
            }
            return false;
        },
        'nempty': function(a) {
            if (typeof a === 'string' || Array.isArray(a) || Buffer.isBuffer(a)) {
                return a.length !== 0;
            } else if (typeof a === 'object' && a !== null) {
                return Object.keys(a).length !== 0;
            }
            return false;
        },
        'istype': function(a, b) {
            if (b === "array") { return Array.isArray(a); }
            else if (b === "buffer") { return Buffer.isBuffer(a); }
            else if (b === "json") {
                try { JSON.parse(a); return true; }   // or maybe ??? a !== null; }
                catch(e) { return false;}
            }
            else if (b === "null") { return a === null; }
            else { return typeof a === b && !Array.isArray(a) && !Buffer.isBuffer(a) && a !== null; }
        },
        'hask': function(a, b) {
            return (typeof b !== "object" )  &&  a.hasOwnProperty(b+"");
        },
        'jsonata_exp': function(a, b) { return (b === true); },
        'else': function(a) { return a === true; }
    };

    function AlarmNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        let valid = true;
        let ontimer, offtimer;

        this.rules = config.rules || { "critical": [], "alert": [], "warning": [], "info": [] };
        this.lastState = { "critical": false, "alert": false, "warning": false, "info": false };
        this.delayon = parseInt(config.delayon) || 0;
        this.delayoff = parseInt(config.delayoff) || 0;
        this.checkall = config.checkall || "true";
        this.presentValue = null;
        this.previousValue = null;
        this.property = config.property;
        this.propertyType = config.propertyType || "msg";
        if (this.propertyType === 'jsonata') {
            try {
                this.property = RED.util.prepareJSONataExpression(this.property, this);
            } catch(err) {
                this.error(RED._("switch.errors.invalid-expr", { error: err.message }));
                return;
            }
        }

        for (let severity of severities) {
            if (this.rules && this.rules[severity]) {
                for (let rule of this.rules[severity]) {
                    if (!rule.vt) {
                        rule.vt = !isNaN(Number(rule.v)) ? 'num' : 'str';
                    }
                    if (rule.vt === 'num') {
                        if (!isNaN(Number(rule.v))) {
                            rule.v = Number(rule.v);
                        }
                    } else if (rule.vt === "jsonata") {
                        try {
                            rule.v = RED.util.prepareJSONataExpression(rule.v, node);
                        } catch(err) {
                            this.error(RED._("switch.errors.invalid-expr", { error: err.message }));
                            valid = false;
                        }
                    }
                    if (typeof rule.v2 !== 'undefined') {
                        if (!rule.v2t) {
                            rule.v2t = !isNaN(Number(rule.v2)) ? 'num' : 'str';
                        }
                        if (rule.v2t === 'num') {
                            rule.v2 = Number(rule.v2);
                        } else if (rule.v2t === 'jsonata') {
                            try {
                                rule.v2 = RED.util.prepareJSONataExpression(rule.v2, node);
                            } catch(err) {
                                this.error(RED._("switch.errors.invalid-expr", { error: err.message }));
                                valid = false;
                            }
                        }
                    }
                }
            }
        }

        if (!valid) {
            return;
        }

        let getV1 = function(msg, rule, hasParts) {
            if (rule.vt === 'prev') {
                return node.previousValue;
            } else if (rule.vt === 'jsonata') {
                let exp = rule.v;
                if (rule.t === 'jsonata_exp') {
                    if (hasParts) {
                        exp.assign("I", msg.parts.index);
                        exp.assign("N", msg.parts.count);
                    }
                }
                try {
                    return RED.util.evaluateJSONataExpression(exp, msg);
                }
                catch (err) {
                    throw RED._("switch.errors.invalid-expr", { error: err.message });
                }
            } else if (rule.vt === 'json') {
                return "json"; // TODO: ?! invalid cae
            } else if (rule.vt === 'null') {
                return  "null";
            } else {
                return RED.util.evaluateNodeProperty(rule.v, rule.vt, node, msg);
            }
        };
    
        let getV2 = function(msg, rule) {
            let v2 = rule.v2;
            if (rule.v2t === 'prev') {
                return node.previousValue;
            } else if (rule.v2t === 'jsonata') {
                try {
                    return RED.util.evaluateJSONataExpression(rule.v2, msg);
                }
                catch (err) {
                    throw RED._("switch.errors.invalid-expr", { error: err.message });
                }
            } else if (typeof v2 !== 'undefined') {
                return RED.util.evaluateNodeProperty(rule.v2, rule.v2t, node, msg);
            } else {
                return v2;
            }
        };

        let checkRules = function(msg, severity) {
            try {
                let results = 0;
                let elseflag = true;
                let rules = node.rules[severity];
                for (let rule of rules) {
                    let v1 = getV1(msg, rule);
                    let v2 = getV2(msg, rule);
                    if (rule.t === "else") {
                        node.presentValue = elseflag; // TODO: why do this?
                        elseflag = true;
                    }
                    if (operators[rule.t](node.presentValue, v1, v2, rule.case, msg.parts)) {
                        results++;
                        elseflag = false;
                        if (node.checkall === "false") { // logical OR
                            return true;
                        }
                    }
                    else {
                        if (node.checkall === "true") { // logical AND
                            return false;
                        }
                    }
                }
                return !!results && results === rules.length;
            }
            catch (err) {
                node.warn(err);
            }
        };

        let clearOnTimer = function() {
            clearTimeout(ontimer);
            ontimer = null;
        };

        let clearOffTimer = function() {
            clearTimeout(offtimer);
            offtimer = null;
        };

        let sendAlarm = (msg, startValue) => {
            // if state has already changed to the payload state, then another
            // message executed during the delay period. No need to continue
            let lastState = node.lastState[msg.payload.severity];
            if (msg.payload.state === lastState) {
                return;
            }

            // if no change of value after delay, then send message. 
            // otherwise check rules again before sending message
            let send = false;
            if (node.presentValue === startValue) {
                send = true;
            } else {
                let currentState = checkRules(msg, msg.payload.severity);
                send = lastState !== currentState;
                if (send) {
                    msg.payload.value = node.presentValue;
                    msg.payload.state = currentState;
                }
            }

            if (send) {
                node.send(msg);
                node.lastState[msg.payload.severity] = msg.payload.state;
            }
        };

        let updateNodeStatus = function(severity, delaySec) {
            let time = "";
            if (delaySec) {
                let d = new Date();
                d.setSeconds(d.getSeconds() + node.delayon);
                time = " @ " +  d.toLocaleTimeString();
            }
            node.status({ fill: severity === "inactive" ? "grey" : "red", shape: "dot", text: severity + time });
        };

        let fireWithDelay = function(msg) {
            let startValue = msg.payload.value;
            if (msg.payload.state) {
                if (!ontimer) {
                    clearOffTimer();
                    updateNodeStatus(msg.payload.severity, node.delayon);
                    // run on timer
                    ontimer = setTimeout(() => {
                        sendAlarm(msg, startValue);
                        clearOnTimer();
                    }, node.delayon * 1000);
                }
            } else {
                if (!offtimer) {
                    clearOnTimer();
                    updateNodeStatus("inactive", node.delayoff);
                    // run off timer
                    offtimer = setTimeout(() => {
                        sendAlarm(msg, startValue);
                        clearOffTimer();
                    }, node.delayoff * 1000);
                }
            }
        };
    
        let processMessage = function(msg) {
            try {
                if (node.propertyType === 'jsonata') {
                    try {
                        node.presentValue = RED.util.evaluateJSONataExpression(node.property, msg);
                    }
                    catch (err) {
                        throw RED._("switch.errors.invalid-expr", { error: err.message });
                    }
                } else {
                    node.presentValue = RED.util.evaluateNodeProperty(node.property, node.propertyType, node, msg);
                }
            }
            catch (err) {
                node.warn(err);
                return;
            }

            for (let severity of severities) {
                try {
                    let currentState = checkRules(msg, severity);
                    let lastState = node.lastState[severity];
                    if (lastState !== currentState) { // alarm state has changed
                        let new_msg = RED.util.cloneMessage(msg);
                        new_msg.payload = {
                            "name": node.name,
                            "severity": severity,
                            "value": node.presentValue,
                            "state": currentState
                        };
                        fireWithDelay(new_msg);
                    }
                }
                catch (err) {
                    node.warn(err);
                }
            }

            let activeAlarms = severities.filter(s => node.lastState[s]);
            updateNodeStatus(activeAlarms.length ? activeAlarms.join(', ') : "inactive");
            node.previousValue = node.presentValue;
        }

        let pendingMessages = [];
        let handlingMessage = false;
        let processMessageQueue = function(msg) {
            if (msg) {
                // A new message has arrived - add it to the message queue
                pendingMessages.push(msg);
                if (handlingMessage) {
                    // The node is currently processing a message, so do nothing more with this message
                    return;
                }
            }
            if (pendingMessages.length === 0) {
                // There are no more messages to process, clear the active flag and return
                handlingMessage = false;
                return;
            }

            // There are more messages to process. Get the next message and start processing it. Recurse back in to check for any more
            let nextMsg = pendingMessages.shift();
            handlingMessage = true;
            try {
                processMessage(nextMsg);
            }
            catch (err) {
                node.error(err, nextMsg);
            }
            processMessageQueue();
        }

        this.on('input', function(msg) {
            processMessageQueue(msg);
        });
    }

    RED.nodes.registerType("ur_alarm", AlarmNode);
}