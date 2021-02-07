module.exports = function (RED) {
    let operators = {
        '_negOp': function (op, a, b1, b2, c, db, dbt) {
            let result = this[op](a, b1, b2, c, db, dbt);
            if (typeof result !== 'undefined') {
                return !result;
            }
        },
        'eq': function (a, b1, b2, c, db, dbt) {
            if (typeof a === 'undefined' || typeof b1 === 'undefined') {
                return;
            }
            switch (
                dbt // deadband type
            ) {
                case 'high':
                    return a >= b1 && a <= b1 + db;
                case 'mid':
                    return Math.abs(a - b1) <= db;
                case 'low':
                    return a <= b1 && a >= b1 - db;
            }
            return a == b1;
        },
        'neq': function (a, b1, b2, c, db, dbt) {
            return this._negOp('eq', a, b1, b2, c, db, dbt);
        },
        'lt': function (a, b1, b2, c, db, dbt) {
            if (typeof a === 'undefined' || typeof b1 === 'undefined') {
                return;
            }
            switch (
                dbt // deadband type
            ) {
                //           ___________TRUE__________ | _____FALSE__________ | IN DEADBAND
                case 'high':
                    return a < b1 ? true : a >= b1 + db ? false : undefined;
                case 'mid':
                    return a < b1 - db ? true : a >= b1 + db ? false : undefined;
                case 'low':
                    return a < b1 - db ? true : a >= b1 ? false : undefined;
            }
            return a < b1;
        },
        'lte': function (a, b1, b2, c, db, dbt) {
            if (typeof a === 'undefined' || typeof b1 === 'undefined') {
                return;
            }
            switch (
                dbt // deadband type
            ) {
                //           ___________TRUE__________ | _____FALSE__________ | IN DEADBAND
                case 'high':
                    return a <= b1 ? true : a > b1 + db ? false : undefined;
                case 'mid':
                    return a <= b1 - db ? true : a > b1 + db ? false : undefined;
                case 'low':
                    return a <= b1 - db ? true : a > b1 ? false : undefined;
            }
            return a <= b1;
        },
        'gt': function (a, b1, b2, c, db, dbt) {
            return this._negOp('lte', a, b1, b2, c, db, dbt);
        },
        'gte': function (a, b1, b2, c, db, dbt) {
            return this._negOp('lt', a, b1, b2, c, db, dbt);
        },
        'btwn': function (a, b1, b2) {
            return (a >= b1 && a <= b2) || (a <= b1 && a >= b2);
        },
        'cont': function (a, b1) {
            return (a + '').indexOf(b1) != -1;
        },
        'regex': function (a, b1, b2, c) {
            return (a + '').match(new RegExp(b1, c ? 'i' : ''));
        },
        'true': function (a) {
            return a === true;
        },
        'false': function (a) {
            return a === false;
        },
        'null': function (a) {
            return typeof a == 'undefined' || a === null;
        },
        'nnull': function (a) {
            return typeof a != 'undefined' && a !== null;
        },
        'empty': function (a) {
            if (typeof a === 'string' || Array.isArray(a) || Buffer.isBuffer(a)) {
                return a.length === 0;
            } else if (typeof a === 'object' && a !== null) {
                return Object.keys(a).length === 0;
            }
            return false;
        },
        'nempty': function (a) {
            if (typeof a === 'string' || Array.isArray(a) || Buffer.isBuffer(a)) {
                return a.length !== 0;
            } else if (typeof a === 'object' && a !== null) {
                return Object.keys(a).length !== 0;
            }
            return false;
        },
        'istype': function (a, b1) {
            if (b1 === 'array') {
                return Array.isArray(a);
            } else if (b1 === 'buffer') {
                return Buffer.isBuffer(a);
            } else if (b1 === 'json') {
                try {
                    JSON.parse(a);
                    return true;
                } catch (e) {
                    // or maybe ??? a !== null; }
                    return false;
                }
            } else if (b1 === 'null') {
                return a === null;
            } else {
                return typeof a === b1 && !Array.isArray(a) && !Buffer.isBuffer(a) && a !== null;
            }
        },
        'hask': function (a, b1) {
            return typeof b1 !== 'object' && a.hasOwnProperty(b1 + '');
        },
        'jsonata_exp': function (a, b1) {
            return b1 === true;
        },
    };

    function CompareNode(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        let valid = true;

        this.inhibit = false;
        this.inhibitTimer = null;
        this.topic = config.topic || '';
        this.topics = config.topics || [];
        this.conditions = config.conditions || [];
        this.checkall = config.checkall || 'true';
        this.lastState = false;
        this.latched = false;
        this.latching = config.latching;
        this.stateMap = new Array(this.conditions.length);

        for (let cond of this.conditions) {
            if (!cond.varB1t) {
                cond.varB1t = !isNaN(Number(cond.varB1)) ? 'num' : 'str';
            }
            if (cond.varB1t === 'num') {
                if (!isNaN(Number(cond.varB1))) {
                    cond.varB1 = Number(cond.varB1);
                }
            } else if (cond.varB1t === 'jsonata') {
                try {
                    cond.varB1 = RED.util.prepareJSONataExpression(cond.varB1, node);
                } catch (err) {
                    this.error(RED._('switch.errors.invalid-expr', { error: err.message }));
                    valid = false;
                }
            }
            if (typeof cond.varB2 !== 'undefined') {
                if (!cond.varB2t) {
                    cond.varB2t = !isNaN(Number(cond.varB2)) ? 'num' : 'str';
                }
                if (cond.varB2t === 'num') {
                    cond.varB2 = Number(cond.varB2);
                } else if (cond.varB2t === 'jsonata') {
                    try {
                        cond.varB2 = RED.util.prepareJSONataExpression(cond.varB2, node);
                    } catch (err) {
                        this.error(RED._('switch.errors.invalid-expr', { error: err.message }));
                        valid = false;
                    }
                }
            }
        }

        if (!valid) {
            return;
        }

        this.variableMap = {};
        this.topicMap = {};
        this.valueMap = { values: [], indices: {} };
        this.msgCache = {};

        for (let i = 0; i < this.topics.length; i++) {
            let topicObj = this.topics[i];
            if (topicObj.name && topicObj.topic) {
                this.variableMap[topicObj.name] = topicObj;
                this.topicMap[topicObj.topic] = topicObj;
                this.valueMap.indices[topicObj.topic] = i;
            }
        }

        let updateValueMap = function (topic, value) {
            let i = node.valueMap.indices[topic];
            node.valueMap.values[i] = value;
        };

        let cacheMessage = function (msg) {
            let topicObj = node.topicMap[msg.topic];
            if (topicObj) {
                let varName = topicObj.name;
                node.msgCache[varName] = msg;
            }
        };

        let getVariable = function (varName, varType) {
            if (!varType || typeof varName === 'undefined') {
                return;
            }
            switch (varType) {
                case 'json':
                    return 'json';
                case 'null':
                    return 'null';
                case 'num':
                case 'str':
                    return varName;
            }
            let msg = node.msgCache[varName];
            if (msg) {
                if (varType === 'var') {
                    let topicObj = node.variableMap[varName];
                    if (topicObj && topicObj.property) {
                        let value = RED.util.evaluateNodeProperty(topicObj.property, 'msg', node, msg);
                        updateValueMap(topicObj.topic, value);
                        return value;
                    }
                } else if (varType === 'jsonata') {
                    try {
                        return RED.util.evaluateJSONataExpression(varName, msg);
                    } catch (err) {
                        throw RED._('switch.errors.invalid-expr', { error: err.message });
                    }
                } else {
                    return RED.util.evaluateNodeProperty(varName, varType, node, msg);
                }
            }
        };

        let evaluateConditions = function (msg) {
            try {
                let topicObj = node.topicMap[msg.topic];
                if (topicObj) {
                    let varName = topicObj.name;
                    for (let i = 0; i < node.conditions.length; i++) {
                        let cond = node.conditions[i];
                        if (
                            cond.varA === varName ||
                            (cond.varB1t === 'var' && cond.varB1 === varName) ||
                            (cond.varB2t === 'var' && cond.varB2 === varName)
                        ) {
                            let varA = getVariable(cond.varA, 'var');
                            let varB1 = getVariable(cond.varB1, cond.varB1t); // varB1 isn't used for the is-true/false/null/etc operators, so it can be undefined
                            let varB2 = getVariable(cond.varB2, cond.varB2t); // varB2 is only used for the "between" operator, so it can be undefined
                            let db = parseFloat(cond.db) || 0;
                            node.stateMap[i] = operators[cond.t](varA, varB1, varB2, cond.case, db, cond.dbt);
                        }
                    }
                }
            } catch (err) {
                node.warn(err);
            }
        };

        let checkOutputStates = function () {
            if (node.checkall === 'true') {
                // logical AND
                for (let state of node.stateMap) {
                    if (state === false) {
                        return false; // shortcut to false on first false
                    } else if (state !== true) {
                        return undefined; // shortcut to undefined on first undefined
                    }
                }
                return true; // no falses, no undefined... return true
            } else {
                // logical OR
                let totalFalse = 0;
                for (let state of node.stateMap) {
                    if (state === true) {
                        return true; // shortcut to true on first true
                    } else if (state === false) {
                        totalFalse++;
                    }
                }
                if (totalFalse === node.stateMap.length) {
                    return false;
                }
                return undefined;
            }
        };

        let updateNodeStatus = function () {
            let latched = node.latched ? ' latched' : '';
            if (node.lastState) {
                node.status({ fill: 'green', shape: 'dot', text: 'active' + latched });
            } else {
                node.status({ fill: 'grey', shape: 'dot', text: 'inactive' + latched });
            }
        };

        let processMessage = function (msg) {
            try {
                cacheMessage(msg);
                evaluateConditions(msg);
                if (node.latching && node.latched) {
                    return;
                }
                let currentState = checkOutputStates();
                if (node.latching && currentState) {
                    node.latched = true;
                }
                if (typeof currentState !== 'undefined' && node.lastState !== currentState) {
                    let outMsg = [{ topic: node.topic, payload: { compareState: currentState } }];
                    for (let topic in node.valueMap.indices) {
                        let i = node.valueMap.indices[topic];
                        let payload = node.valueMap.values[i];
                        let topicObj = node.topicMap[topic];
                        if (topicObj) {
                            let varName = topicObj.name;
                            outMsg[0].payload[varName] = payload;
                        }
                        outMsg[i + 1] = { topic: topic, payload: payload };
                    }
                    node.send(outMsg);
                    node.lastState = !!currentState;
                    updateNodeStatus();
                }
            } catch (err) {
                node.warn(err);
            }
        };

        let pendingMessages = [];
        let handlingMessage = false;
        let processMessageQueue = function (msg) {
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
            } catch (err) {
                node.error(err, nextMsg);
            }
            processMessageQueue();
        };

        let checkInhibit = function (msg) {
            if (msg.hasOwnProperty('inhibit')) {
                try {
                    let inhibit = msg.inhibit.toString().toLowerCase().trim();
                    if (inhibit === '0' || inhibit === 'false') {
                        node.inhibit = false;
                        node.status({});
                        clearTimeout(node.inhibitTimer);
                        node.inhibitTimer = null;
                    } else if (inhibit === 'true') {
                        node.inhibit = true;
                        node.status({ fill: 'grey', shape: 'dot', text: 'inhibited' });
                        clearTimeout(node.inhibitTimer);
                        node.inhibitTimer = null;
                    } else if (!isNaN(inhibit)) {
                        inhibit = parseInt(inhibit);
                        if (inhibit > 0) {
                            node.inhibit = true;
                            let d = new Date();
                            d.setSeconds(d.getSeconds() + inhibit);
                            node.status({ fill: 'grey', shape: 'dot', text: 'inhibited until ' + d.toLocaleString() });
                            node.inhibitTimer = setTimeout(() => {
                                // clear inhibit after timer elapses
                                node.inhibit = false;
                                node.status({});
                            }, inhibit * 1000);
                        }
                    }
                } catch (e) {
                    node.warn(e);
                }
            }
            return node.inhibit;
        };

        let resetLatch = function (msg) {
            if (msg.hasOwnProperty('reset')) {
                node.latched = false;
                return true;
            }
            return false;
        };

        this.on('input', function (msg) {
            if (checkInhibit(msg)) {
                return;
            }
            if (resetLatch(msg)) {
                // when latch is cleared, reprocess all cached messages
                for (let varName in node.msgCache) {
                    processMessage(node.msgCache[varName]);
                }
            } else {
                processMessageQueue(msg);
            }
        });

        updateNodeStatus();
    }

    RED.nodes.registerType('ur_compare', CompareNode);
};
