var cron = require('node-cron');
var parser = require('cron-parser');
var moment = require('moment');
// Per-node schedule runtime, keyed by node id, living across redeploys.
// Node-RED destroys and re-creates the node object on every deploy, but the cron
// jobs are expensive to build (~2.5ms per cron.schedule() call), so an unchanged
// node adopts the runtime it built last time instead of rebuilding it.
var runtimes = new Map();

// Single midnight rebuild job shared by every node (patterns like "last weekday"
// are resolved relative to today, so they have to be recomputed each day).
var midnightJob = null;

// Fields the node computes and writes back onto its own config. They are derived
// from the source fields, so they must stay out of the reuse signature or every
// deploy would look like a change.
var COMPUTED_FIELDS = { pattern: true, _pattern: true, type: true, timestamp: true, typeNum: true };

// Deterministic serialisation: key order must not affect the result, because the
// editor round-trips config through JSON and does not preserve insertion order.
var stableStringify = function (value) {
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value === undefined ? null : value);
    }
    if (Array.isArray(value)) {
        return '[' + value.map(stableStringify).join(',') + ']';
    }
    let keys = Object.keys(value)
        .filter((k) => !COMPUTED_FIELDS[k])
        .sort();
    return '{' + keys.map((k) => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
};

// Everything that decides which cron jobs exist. Excludes topic/topicPattern/label
// and friends: those are read through the live config at fire time, so changing
// them does not require rebuilding any cron job.
var scheduleSignature = function (config) {
    return stableStringify({
        weekdays: config.weekdays || [],
        dates: config.dates || [],
        values: config.values || [],
        payloadType: config.payloadType,
        holidaysId: config.holidays,
    });
};

var holidaySignature = function (holidays) {
    return stableStringify(holidays || []);
};

var todayKey = function () {
    let d = new Date();
    return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
};

// Cron callbacks are created once and then outlive the node object that created
// them. They dispatch through the runtime so they always reach the *current*
// node and config rather than the closed-over one from a previous deploy.
var dispatch = function () {
    let rt = this.rt;
    if (!rt || !rt.node) {
        return;
    }
    let handler = rt[this.fn];
    if (typeof handler === 'function') {
        handler.call({ event: this.event, type: this.type });
    }
};

// Identity of a cron job: the pattern actually handed to node-cron, plus which
// handler it dispatches to. Jobs were previously keyed by the schedule's nominal
// `sch.pattern`, which is neither. That conflated jobs that genuinely differ (a
// recovery job fires at a one-off time, but carried the key of the annual job it
// was recovering) and merged jobs that are genuinely distinct (the occupied and
// unoccupied entries on one date both flatten to 00:00:01 and 23:59:59 markers).
// Either way the loser was dropped from the map without destroy(), leaving a
// node-cron task that ran forever -- two per date, on every rebuild.
var cronJobKey = function (pattern, fn, type) {
    return pattern + '|' + fn + '|' + type;
};

var destroyRuntimeJobs = function (rt, origin) {
    for (let key in rt.cronJobs) {
        let entry = rt.cronJobs[key];
        if (origin && entry.origin !== origin) {
            continue;
        }
        try {
            // node-cron 4: stop() leaves the task in the global registry, only
            // destroy() removes it. Using stop() here leaks every task forever.
            entry.job.destroy();
        } catch (e) {
            /* task already gone */
        }
        delete rt.cronJobs[key];
    }
};

module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function ScheduleNode(config) {
        RED.nodes.createNode(this, config);
        // the holidays config node may be unset, disabled or deleted
        let holidaysNode = RED.nodes.getNode(config.holidays);
        let sourceHolidays = (holidaysNode && holidaysNode.events) || [];
        // holidaysNode.events is the live config-node array shared by every schedule
        // node; buildSchedules writes pattern/_pattern/type onto its entries, so each
        // node gets its own copy rather than mutating what its siblings are reading.
        this.holidays = JSON.parse(JSON.stringify(sourceHolidays));
        var node = this;

        // Adopt the runtime this node id built on a previous deploy, if any.
        let rt = runtimes.get(config.id);
        let isNewRuntime = !rt;
        if (isNewRuntime) {
            rt = {
                cronJobs: {}, // pattern -> { job, event, type, origin }
                valuePriority: { holiday: null, date: null, weekday: null },
                heartbeatTimer: null,
                holidays: [],
                signature: null,
                holidaySignature: null,
                builtOn: null,
                orphanTimer: null,
            };
            runtimes.set(config.id, rt);
        }
        clearTimeout(rt.orphanTimer);
        rt.orphanTimer = null;
        // Re-point the runtime at the node object and config for this deploy. Cron
        // callbacks created on earlier deploys reach these through `rt`.
        rt.node = node;
        rt.holidays = this.holidays;
        this.cronJobs = rt.cronJobs;
        this.valuePriority = rt.valuePriority;

        let newSignature = scheduleSignature(config);
        let newHolidaySignature = holidaySignature(sourceHolidays);

        var { tab, group, page, folders } = ui.makeMenuTree(RED, config);

        /*
        HELPER FUNCTIONS
        */

        let setPrioritySchedule = function () {
            if (RED.settings.verbose) {
                node.log('setPrioritySchedule for ' + this.type);
            }
            rt.valuePriority[this.type] = true; // just make the value non-falsy. Later an actual schedule value will be applied.
        };

        let clearPrioritySchedule = function () {
            if (RED.settings.verbose) {
                node.log('clearPrioritySchedule for ' + this.type);
            }
            rt.valuePriority[this.type] = null;
        };

        let getValueFromName = function (value) {
            return config.values.find((v) => v.name === value);
        };

        let fireEvent = function () {
            // there is an event to fire
            if (this.event && this.type) {
                try {
                    // set value in priority object
                    rt.valuePriority[this.type] = getValueFromName(this.event.value);
                    let value = undefined;

                    if (rt.valuePriority.holiday) {
                        //prioritize holiday schedules over date schedules
                        if (this.type === 'holiday' && rt.valuePriority.holiday.value) {
                            value = rt.valuePriority.holiday.value;
                        }
                    } else if (rt.valuePriority.date) {
                        //prioritize date schedules over weekday schedules
                        if (this.type === 'date' && rt.valuePriority.date.value) {
                            value = rt.valuePriority.date.value;
                        }
                    } else if (rt.valuePriority.weekday) {
                        if (this.type === 'weekday' && rt.valuePriority.weekday.value) {
                            value = rt.valuePriority.weekday.value;
                        }
                    }
                    if (value) {
                        let next = nextEvent();
                        let nextState = getValueFromName(next.event.value).value;
                        let nextTimestamp = next.timestamp;
                        let payload = value;
                        if (config.payloadType && config.payloadType === 'tod') {
                            payload = {
                                'current_state': value,
                                'next_state': nextState,
                                'time_to_next_state': Math.floor((nextTimestamp - Date.now()) / 60000) /* minutes */,
                            };
                        }
                        if (RED.settings.verbose) {
                            node.log(`fireEvent ${this.type} ${JSON.stringify(payload)}`);
                        }
                        let msg = { topic: config.topic, payload: payload };
                        let nowText = `now: ${value} [${this.type}]`;
                        let statusText = `${nowText},  next: ${nextState} [${next.type}] @ ${new Date(
                            nextTimestamp
                        ).toLocaleString()}`;
                        // remembered so a redeploy that reuses these cron jobs can
                        // restore state without re-walking every cron pattern.
                        // nowText is kept separately so the "next:" half can be
                        // recomputed on its own when only the holidays changed.
                        rt.lastEmit = { msg: msg, statusText: statusText, nowText: nowText };
                        heartbeatSend(msg);
                        node.status({ text: statusText });
                    }
                } catch (err) {
                    node.error(err);
                }
            }
        };

        let heartbeatSend = function (msg) {
            try {
                rt.node.send(msg);
                if (
                    typeof msg !== undefined &&
                    typeof msg.payload !== undefined &&
                    typeof msg.payload.time_to_next_state !== undefined &&
                    msg.payload.time_to_next_state > 0
                ) {
                    let heartbeatMins = 5; /* heartbeat in minutes */
                    let heartbeatMs = heartbeatMins * 60000; /* heartbeat in milliseconds */
                    let lasttime = msg.payload.time_to_next_state;
                    let topic = msg.topic;
                    let payload = msg.payload;
                    let heartbeatFunc = function () {
                        lasttime -= heartbeatMins;
                        let newMsg = { topic: topic, payload: payload }; // create new msg object
                        newMsg.payload.time_to_next_state = lasttime;
                        rt.node.send(newMsg);
                        if (lasttime > 0) {
                            clearTimeout(rt.heartbeatTimer);
                            rt.heartbeatTimer = setTimeout(heartbeatFunc, heartbeatMs);
                        }
                    };
                    clearTimeout(rt.heartbeatTimer);
                    rt.heartbeatTimer = setTimeout(heartbeatFunc, heartbeatMs);
                }
            } catch (err) {
                node.error(err);
            }
        };

        // `originFilter` narrows the scan to events derived from one source, so a
        // holiday-only rebuild does not pay for a cron-parser walk over every
        // weekday and date event as well.
        let getEventsArray = function (originFilter) {
            let events = [];
            Object.values(rt.cronJobs).forEach((item) => {
                if (item.event && (!originFilter || item.origin === originFilter)) {
                    events.push({ ...item.event, type: item.type });
                }
            });
            rt.holidays.forEach((element) => {
                element.type = 'holiday';
            });
            const holidays = !originFilter || originFilter === 'holiday' ? rt.holidays : [];
            return events.concat(holidays);
        };

        let applyPriorityFilter = function (events, today) {
            if (events.length === 0) return events;

            const eventsByDate = {};
            for (const event of events) {
                const eventDate = new Date(event.timestamp);
                const dateKey = eventDate.toDateString();
                if (!eventsByDate[dateKey]) {
                    eventsByDate[dateKey] = [];
                }
                eventsByDate[dateKey].push(event);
            }

            // For each date, only keep events with the highest priority
            const filteredEvents = [];
            for (const dateKey in eventsByDate) {
                const dateEvents = eventsByDate[dateKey];
                const highestPriority = Math.min(...dateEvents.map((e) => e.typeNum));
                const highestPriorityEvents = dateEvents.filter((e) => e.typeNum === highestPriority);
                filteredEvents.push(...highestPriorityEvents);
            }

            return filteredEvents;
        };

        let nextEvent = function (originFilter) {
            let greatestPriority = 4;
            let nextFire = 0;
            const today = new Date();
            const currentTime = Date.now();
            const nextFires = [];
            const typeNum = { 'holiday': 1, 'date': 2, 'weekday': 3 };
            let next;

            const events = getEventsArray(originFilter);

            for (const event of events) {
                try {
                    // For holidays, use the original _pattern for event calculations
                    // correctForNthAndLastRules should only be used for cron job scheduling
                    const patternToUse = (event.type === 'holiday' && event._pattern) ? event._pattern : event.pattern;
                    if (!patternToUse) {
                        continue;
                    }

                    const eventTypeNum = typeNum[event.type];
                    if (typeof eventTypeNum === 'undefined') {
                        continue;
                    }

                    const parsedFire = parser.parseExpression(patternToUse);
                    nextFire = parsedFire.next().toDate().getTime();

                    if (nextFire > currentTime) {
                        const hasNthPattern = event._pattern && event._pattern.includes('#');
                        if (hasNthPattern) {
                            const weekdayPattern = event._pattern.split(' ')[5];
                            if (isNthWeekday(weekdayPattern, nextFire)) {
                                nextFires.push({
                                    timestamp: nextFire,
                                    type: event.type,
                                    typeNum: eventTypeNum,
                                    event: event,
                                });
                            }
                        } else {
                            nextFires.push({
                                timestamp: nextFire,
                                type: event.type,
                                typeNum: eventTypeNum,
                                event: event,
                            });
                        }
                    }
                } catch (err) {
                    console.error('Error: ' + err.message);
                }
            }

            const filteredFires = applyPriorityFilter(nextFires, today);

            let sortedFireTimes = filteredFires.sort((a, b) => a.timestamp - b.timestamp);

            if (sortedFireTimes.length === 0) {
                return undefined;
            }

            let soonestFireDate = new Date(sortedFireTimes[0].timestamp);

            // set next event based on event type priority
            for (let fire of sortedFireTimes) {
                // set fire to soonest occurrence of highest priority event on the date which a fire will soonest occur
                if (fire.typeNum < greatestPriority && isSameDay(soonestFireDate, new Date(fire.timestamp))) {
                    next = fire;
                    greatestPriority = fire.typeNum;
                }
            }
            return next;
        };

        let prevEvent = function (originFilter) {
            let greatestPriority = 4;
            let prevFire = 0;
            const today = new Date();
            const currentTime = Date.now();
            const prevFires = [];
            const typeNum = { 'holiday': 1, 'date': 2, 'weekday': 3 };
            let prev;

            const events = getEventsArray(originFilter);

            for (const event of events) {
                try {
                    // For holidays, use the original _pattern for event calculations
                    // correctForNthAndLastRules should only be used for cron job scheduling
                    const patternToUse = (event.type === 'holiday' && event._pattern) ? event._pattern : event.pattern;
                    if (!patternToUse) {
                        continue;
                    }

                    // Early type validation
                    const eventTypeNum = typeNum[event.type];
                    if (typeof eventTypeNum === 'undefined') {
                        continue;
                    }

                    // parse cron pattern and get just the previous occurrence
                    const parsedFire = parser.parseExpression(patternToUse);
                    prevFire = parsedFire.prev().toDate().getTime();

                    if (prevFire < currentTime) {
                        // Cache pattern analysis to avoid repeated string operations
                        const hasNthPattern = event._pattern && event._pattern.includes('#');
                        if (hasNthPattern) {
                            const weekdayPattern = event._pattern.split(' ')[5];
                            if (isNthWeekday(weekdayPattern, prevFire)) {
                                prevFires.push({
                                    timestamp: prevFire,
                                    type: event.type,
                                    typeNum: eventTypeNum,
                                    event: event,
                                });
                            }
                        } else {
                            prevFires.push({
                                timestamp: prevFire,
                                type: event.type,
                                typeNum: eventTypeNum,
                                event: event,
                            });
                        }
                    }
                } catch (err) {
                    console.error('Error: ' + err.message);
                }
            }

            const filteredFires = applyPriorityFilter(prevFires, today);

            let sortedFireTimes = filteredFires.sort((a, b) => b.timestamp - a.timestamp);

            if (sortedFireTimes.length === 0) {
                return undefined;
            }

            let mostRecentFireDate = new Date(sortedFireTimes[0].timestamp);

            // set prev event based on event type priority
            for (let fire of sortedFireTimes) {
                if (fire.typeNum < greatestPriority && isSameDay(mostRecentFireDate, new Date(fire.timestamp))) {
                    // set fire to last occurrence of highest priority event on the date which a fire most recently occurred
                    prev = fire;
                    greatestPriority = fire.typeNum;
                }
            }
            return prev;
        };

        let isSameDay = function (dateA, dateB) {
            return (
                dateA.getDate() == dateB.getDate() &&
                dateA.getMonth() == dateB.getMonth() &&
                dateA.getFullYear() == dateB.getFullYear()
            );
        };

        let secondsFromNow = function (x) {
            return new Date(new Date().getTime() + x * 1000);
        };

        let explodeRange = function (exp) {
            if (exp.indexOf('-') === -1) {
                return exp;
            }
            let [a, b] = exp.split('-');
            a = parseInt(a);
            b = parseInt(b);
            let start = Math.min(a, b);
            let end = Math.max(a, b);
            let range = [];
            while (start <= end) {
                range.push(start++);
            }
            return range.join(',');
        };

        let isNthWeekday = function (weekdayExp, timestamp = Date.now()) {
            let [day, week] = weekdayExp.split('#');
            let weekdays = explodeRange(day).split(',');
            for (let weekday of weekdays) {
                weekday = parseInt(weekday);
                let m = moment(timestamp).date(week * 7 - 6);
                if (m.weekday() > weekday) {
                    m = m.add(7, 'days');
                }
                if (moment(timestamp).diff(m.weekday(weekday), 'days') === 0) {
                    return true;
                }
            }
            return false;
        };

        let isLastWeekday = function (weekdayExp) {
            let weekdays = explodeRange(weekdayExp.replace('L', '')).split(',');
            for (let weekday of weekdays) {
                let m = moment();
                let origYear = m.year();
                let origMonth = m.month();
                m = m.add(1, 'months').date(1).weekday(weekday);
                if (m.month() > origMonth || m.year() > origYear) {
                    m = m.subtract(7, 'days');
                }
                if (moment().diff(m, 'days') === 0) {
                    return true;
                }
            }
            return false;
        };

        let isLastDateOfMonth = function () {
            let m = moment().add(1, 'months').date(1).subtract(1, 'days');
            return moment().diff(m, 'days') === 0;
        };

        let correctForNthAndLastRules = function (schPattern) {
            // check nth and last rules that node-cron currently does not support
            if (schPattern) {
                let pattern = schPattern.split(' ');
                let date = pattern[3];
                let weekday = pattern[5];
                if (date === 'L') {
                    if (isLastDateOfMonth()) {
                        // if the last day, overwrite date field with today
                        pattern[3] = moment().date();
                        return pattern.join(' ');
                    }
                    return null;
                }
                if (weekday.indexOf('#') !== -1) {
                    if (isNthWeekday(weekday)) {
                        // if not the nth weekday, overwrite date field with today
                        pattern[5] = moment().day();
                        return pattern.join(' ');
                    }
                    return null;
                }
                if (weekday.indexOf('L') !== -1) {
                    if (isLastWeekday(weekday)) {
                        // if not the last weekday, overwrite date field with today
                        pattern[5] = moment().day();
                        return pattern.join(' ');
                    }
                    return null;
                }
            }
            return schPattern;
        };

        // Create a cron job and take ownership of it. Re-registering the same
        // identity destroys the job it replaces, so a collision can no longer
        // abandon a live node-cron task.
        // `dispatchEvent` is what the callback receives and is not always the entry's
        // own event: the date and weekday jobs hand their callback a copy carrying
        // the pattern actually scheduled, while the entry keeps the original.
        let trackCronJob = function (pattern, fn, dispatchType, dispatchEvent, entry) {
            let key = cronJobKey(pattern, fn, dispatchType);
            let previous = rt.cronJobs[key];
            if (previous) {
                try {
                    previous.job.destroy();
                } catch (e) {
                    /* task already gone */
                }
            }
            entry.job = cron.schedule(
                pattern,
                dispatch.bind({ rt: rt, fn: fn, event: dispatchEvent, type: dispatchType })
            );
            entry.pattern = pattern;
            rt.cronJobs[key] = entry;
            return entry;
        };

        // A rebuild destroys and recreates the priority markers. When the rebuild
        // lands after a marker's fire time -- the midnight sweep starts at 00:00:00
        // and the start marker is due at 00:00:01, a gap a large site cannot always
        // make -- node-cron schedules the recreated job for its *next* occurrence
        // and today's mark is simply never set. Re-derive it rather than depending
        // on a timer that may already have passed.
        // setCronTime only rewrites the second/minute/hour fields, so the start and end
        // markers always cover the same set of days. One parse settles both: if the
        // start marker has not already fired today then neither has the end marker,
        // and the second parse is only paid on the days a schedule is actually live.
        let applyMissedMarkers = function (startPattern, endPattern, type) {
            try {
                let now = new Date();
                if (!isSameDay(parser.parseExpression(startPattern).prev().toDate(), now)) {
                    return;
                }
                setPrioritySchedule.call({ type: type });
                if (isSameDay(parser.parseExpression(endPattern).prev().toDate(), now)) {
                    // the day is already over; end last so it stays clear
                    clearPrioritySchedule.call({ type: type });
                }
            } catch (e) {
                /* unparseable pattern: leave the cron jobs to do the work */
            }
        };

        let scheduleHolidayJob = function (sch, time) {
            // check nth and last rules that node-cron currently does not support
            let correctedPattern = correctForNthAndLastRules(sch.pattern);
            if (!correctedPattern) {
                return;
            }
            sch.pattern = correctedPattern;

            if (RED.settings.verbose) {
                node.log('scheduleHolidayJob ' + JSON.stringify(sch) + ' ' + (time ? time.toLocaleString() : ''));
            }
            if (time) {
                sch.pattern = setCronTime(correctedPattern, time.getHours(), time.getMinutes(), time.getSeconds());
            }
            trackCronJob(sch.pattern, 'fireEvent', 'holiday', sch, {
                event: sch,
                type: 'holiday',
                origin: 'holiday',
            });
        };

        let scheduleDateJob = function (sch, time) {
            let temporary_pattern = sch.pattern;

            if (RED.settings.verbose) {
                node.log('scheduleDateJob ' + JSON.stringify(sch) + ' ' + (time ? time.toLocaleString() : ''));
            }
            if (time) {
                temporary_pattern = setCronTime(
                    temporary_pattern,
                    time.getHours(),
                    time.getMinutes(),
                    time.getSeconds()
                );
            }
            trackCronJob(temporary_pattern, 'fireEvent', 'date', { ...sch, pattern: temporary_pattern }, {
                event: sch,
                type: 'date',
                origin: 'date',
            });
        };

        let scheduleWeekdayJob = function (sch, time) {
            let temporary_pattern = sch.pattern;

            if (RED.settings.verbose) {
                node.log('scheduleWeekdayJob ' + JSON.stringify(sch) + ' ' + (time ? time.toLocaleString() : ''));
            }
            if (time) {
                temporary_pattern = setCronTime(
                    temporary_pattern,
                    time.getHours(),
                    time.getMinutes(),
                    time.getSeconds()
                );
            }
            trackCronJob(temporary_pattern, 'fireEvent', 'weekday', { ...sch, pattern: temporary_pattern }, {
                event: sch,
                type: 'weekday',
                origin: 'weekday',
            });
        };

        let schedulePriorityScheduleJobs = function (sch, type, time) {
            // check nth and last rules that node-cron currently does not support
            let correctedPattern = correctForNthAndLastRules(sch.pattern);
            if (!correctedPattern) {
                return;
            }
            sch.pattern = correctedPattern;

            // activate date or holiday schedule at beginning of day (unless time overridden)
            let startPattern = setCronTime(
                sch.pattern,
                time ? time.getHours() : 0,
                time ? time.getMinutes() : 0,
                time ? time.getSeconds() : 1
            );
            trackCronJob(startPattern, 'setPrioritySchedule', type, { ...sch, pattern: correctedPattern }, {
                event: sch,
                type: 'background',
                origin: type,
            });
            // deactivate date or holiday schedule at end of day
            let endPattern = setCronTime(sch.pattern, 23, 59, 59);
            trackCronJob(endPattern, 'clearPrioritySchedule', type, sch, {
                event: sch,
                type: 'background',
                origin: type,
            });
            // Both markers may already be due by the time this rebuild runs; whichever
            // has passed today is applied here rather than waiting on a timer that has
            // gone by.
            applyMissedMarkers(startPattern, endPattern, type);
        };

        // `origin` limits the teardown to jobs derived from one source
        // ('weekday' | 'date' | 'holiday'); omit it to tear down everything.
        let destroyCronJobs = function (origin) {
            if (!origin) {
                clearTimeout(rt.heartbeatTimer);
                rt.heartbeatTimer = null;
            }
            try {
                destroyRuntimeJobs(rt, origin);
            } catch (e) {
                node.error(e);
            }
        };

        /*
        SCHEDULE MAGIC
        */

        // Restore the visible state of a node whose cron jobs were reused. Replays the
        // remembered emit instead of calling prevEvent()/nextEvent(), which would cost
        // ~25ms of cron-parser work per node and undo the point of reusing.
        let refreshStatus = function (soonestEvent) {
            if (!rt.lastEmit) {
                node.status({ text: '' });
                return;
            }
            // The remembered msg carries the topic that was live when it was built.
            // topic is deliberately outside the reuse signature (it is read through
            // the live config at fire time), so a topic-only change reuses these cron
            // jobs -- and replaying the msg verbatim would emit the previous topic
            // until the next scheduled event, which can be hours away.
            rt.lastEmit.msg = { ...rt.lastEmit.msg, topic: config.topic };
            rt.node.send(rt.lastEmit.msg);
            if (soonestEvent && rt.lastEmit.nowText) {
                // The current value is unchanged, but the upcoming one may not be.
                let nextValue = getValueFromName(soonestEvent.event.value);
                rt.lastEmit.statusText =
                    `${rt.lastEmit.nowText},  next: ${nextValue ? nextValue.value : soonestEvent.event.value} ` +
                    `[${soonestEvent.type}] @ ${new Date(soonestEvent.timestamp).toLocaleString()}`;
            }
            node.status({ text: rt.lastEmit.statusText });
        };

        // scope 'holiday' rebuilds only the holiday-derived jobs and leaves the
        // weekday/date cron jobs in place; anything else rebuilds the lot.
        let buildSchedulesInternal = function (scope) {
            let holidaysOnly = scope === 'holiday';
            node.log(holidaysOnly ? 'Rebuilding holiday schedules...' : 'Building schedules...');

            // stop and delete the cron jobs being replaced
            destroyCronJobs(holidaysOnly ? 'holiday' : undefined);

            // Drop the priority marks belonging to those jobs. The marks are set by
            // the 00:00:01 background job and cleared by its 23:59:59 twin, so a
            // schedule deleted while it was in effect would otherwise leave its mark
            // set with no job left alive to clear it -- and fireEvent's priority
            // chain would then suppress every lower-priority event indefinitely.
            // Whatever is genuinely still in effect is re-marked by the recovery
            // jobs at the end of this rebuild.
            if (holidaysOnly) {
                rt.valuePriority.holiday = null;
            } else {
                rt.valuePriority.holiday = null;
                rt.valuePriority.date = null;
                rt.valuePriority.weekday = null;
            }

            // build map of all holiday events and index by cron pattern
            if (rt.holidays && rt.holidays.length) {
                for (let holidaySch of rt.holidays) {
                    try {
                        // account for no ._pattern key
                        if (!('_pattern' in holidaySch)) {
                            holidaySch._pattern = holidaySch.pattern;
                        }

                        // contingency for old _pattern format
                        let _split_pattern = holidaySch._pattern.split(' ');
                        _split_pattern[1] = holidaySch.minute;
                        _split_pattern[2] = holidaySch.hour;
                        holidaySch._pattern = _split_pattern.join(' ');

                        // clean .pattern for the new schedule build
                        holidaySch.pattern = holidaySch._pattern;

                        // schedule job and "priority schedule" jobs
                        holidaySch.pattern = setCronTime(holidaySch.pattern, holidaySch.hour, holidaySch.minute, '1');
                        scheduleHolidayJob(holidaySch);
                        schedulePriorityScheduleJobs(holidaySch, 'holiday');
                    } catch (err) {
                        node.error(err);
                    }
                }
            }

            // build map of all date events and index by date
            if (!holidaysOnly && config.dates && config.dates.length) {
                let dateSchedules = {};
                for (let dateSch of config.dates) {
                    try {
                        // catalog date schedules to later find last (missed) event
                        let d = new Date(dateSch.date);
                        d.setFullYear(new Date().getFullYear()); // normalize key to current year
                        let dateKey = d.getTime();
                        if (!dateSchedules[dateKey]) {
                            dateSchedules[dateKey] = [];
                        }
                        dateSchedules[dateKey].push(dateSch);

                        // schedule job and "priority schedule" jobs
                        dateSch.pattern = ['0', dateSch.minute, dateSch.hour, d.getDate(), d.getMonth() + 1, '*'].join(
                            ' '
                        );
                        scheduleDateJob(dateSch);
                        schedulePriorityScheduleJobs(dateSch, 'date');
                    } catch (err) {
                        node.error(err);
                    }
                }
            }

            // build array of all weekday events and index by weekday
            if (!holidaysOnly && config.weekdays && config.weekdays.length) {
                let weekdaySchedules = [
                    /* Sunday    */ [],
                    /* Monday    */ [],
                    /* Tuesday   */ [],
                    /* Wednesday */ [],
                    /* Thursday  */ [],
                    /* Friday    */ [],
                    /* Saturday  */ [],
                ];
                for (let weekdaySch of config.weekdays) {
                    try {
                        if (!isNaN(weekdaySch.weekday)) {
                            // catalog weekday schedules to later find last (missed) event
                            weekdaySchedules[parseInt(weekdaySch.weekday)].push(weekdaySch);

                            // schedule job
                            weekdaySch.pattern = [
                                '0',
                                weekdaySch.minute,
                                weekdaySch.hour,
                                '*',
                                '*',
                                weekdaySch.weekday,
                            ].join(' ');
                            scheduleWeekdayJob(weekdaySch);
                        }
                    } catch (err) {
                        node.error(err);
                    }
                }
            }

            if (holidaysOnly) {
                // Weekday and date jobs were left running, so the only thing that can
                // have changed right now is whether a holiday is in effect today.
                // Scanning just the holiday events avoids ~20 cron-parser walks.
                let lastHoliday = prevEvent('holiday');
                if (lastHoliday && isSameDay(new Date(), new Date(lastHoliday.timestamp))) {
                    scheduleHolidayJob(lastHoliday.event, secondsFromNow(1));
                    schedulePriorityScheduleJobs(lastHoliday.event, 'holiday', secondsFromNow(1));
                } else {
                    // Not in effect today, but the new holiday may still be the next
                    // event, so the "next:" half of the status has to be recomputed.
                    // Only nextEvent() is re-run; the current value cannot have moved.
                    refreshStatus(nextEvent());
                }
                return;
            }

            // checks if schedule is empty or not
            // avoids undefined errors
            if (Object.keys(rt.cronJobs).length !== 0) {
                let lastEvent = prevEvent();

                let soonestEvent = nextEvent();

                if (!lastEvent || !soonestEvent) {
                    refreshStatus();
                    return;
                }

                // update node status text
                node.status({
                    text: `now: ${lastEvent.event.value} [${lastEvent.type}],  next: ${soonestEvent.event.value} [${
                        soonestEvent.type
                    }] @ ${new Date(soonestEvent.timestamp).toLocaleString()}`,
                });

                // schedule recovery job: find last (missed event) and fire after 5 second delay
                if (lastEvent) {
                    if (lastEvent.type === 'holiday') {
                        scheduleHolidayJob(lastEvent.event, secondsFromNow(1));
                        schedulePriorityScheduleJobs(lastEvent.event, 'holiday', secondsFromNow(1));
                    } else if (lastEvent.type === 'date') {
                        scheduleDateJob(lastEvent.event, secondsFromNow(1));
                        schedulePriorityScheduleJobs(lastEvent.event, 'date', secondsFromNow(1));
                    } else {
                        fireEvent.bind({ event: lastEvent.event, type: lastEvent.type })();
                    }
                }
            }
            // empty schedule
            else {
                // update node status text
                node.status({
                    text: ``,
                });
            }
        };

        let buildSchedules = function (scope) {
            try {
                buildSchedulesInternal(scope);
            } finally {
                rt.signature = newSignature;
                rt.holidaySignature = newHolidaySignature;
                rt.builtOn = todayKey();
            }
        };

        // Cron callbacks created on earlier deploys dispatch through these, so they
        // must always point at the current deploy's closures.
        rt.fireEvent = fireEvent;
        rt.setPrioritySchedule = setPrioritySchedule;
        rt.clearPrioritySchedule = clearPrioritySchedule;
        rt.rebuild = buildSchedules;

        // Decide how much of this node actually has to be rebuilt.
        // Patterns such as "last weekday of the month" resolve against today, so a
        // runtime built on an earlier day is always stale regardless of config.
        let builtToday = rt.builtOn === todayKey();
        let hasJobs = Object.keys(rt.cronJobs).length > 0;
        if (isNewRuntime || !builtToday || !hasJobs || rt.signature !== newSignature) {
            buildSchedules();
        } else if (rt.holidaySignature !== newHolidaySignature) {
            // Schedule itself is unchanged; only the shared holidays config node moved.
            buildSchedules('holiday');
        } else {
            // Nothing relevant changed: keep the cron jobs this node already owns.
            if (RED.settings.verbose) {
                node.log('Schedules unchanged, reusing existing cron jobs');
            }
            refreshStatus();
        }

        // rebuild every node's schedules at midnight. One shared job drives all of
        // them; the previous per-node guard only ever armed the first node created.
        if (!midnightJob) {
            midnightJob = cron.schedule('0 0 0 * * *', () => {
                // One rebuild per tick. Rebuilding every node in a single turn blocks
                // the Node-RED event loop for the whole sweep -- measured at ~3.1 s
                // for 20 nodes, during which nothing else in the runtime can run, cron
                // callbacks included. Yielding keeps each pause to one node's work.
                // The markers this destroys and recreates are re-derived by
                // applyMissedMarker, so a sweep that outruns them is no longer a gap.
                let pending = Array.from(runtimes.values());
                let step = function () {
                    let runtime = pending.shift();
                    if (runtime && runtime.node && typeof runtime.rebuild === 'function') {
                        try {
                            runtime.rebuild();
                        } catch (e) {
                            runtime.node.error(e);
                        }
                    }
                    if (pending.length) {
                        setImmediate(step);
                    }
                };
                step();
            });
        }

        this.config = {
            ...config,
            id: config.id,
            type: 'schedule',
            label: config.label,
            order: config.order,
            width: config.width || group?.config?.width || 12,
            values: config.values,
            payloadType: config.payloadType,
            defaultView: config.defaultView,
            weekdays: config.weekdays,
            dates: config.dates,
            holidays: this.holidays,
            holidaysId: config.holidays,
            topicPattern: config.topicPattern || '',
            access: config.access || '',
            accessBehavior: config.accessBehavior || 'disable',
        };

        var done = ui.add({
            emitOnlyNewValues: false,
            node: node,
            folders: folders,
            page: page,
            group: group,
            tab: tab,
            control: this.config,
            // control: {
            //     id: config.id,
            //     type: 'schedule',
            //     label: config.label,
            //     order: config.order,
            //     width: config.width || group?.config?.width || 12,
            //     values: config.values,
            //     weekdays: config.weekdays,
            //     dates: config.dates,
            //     holidays: this.holidays,
            //     holidaysId: config.holidays,
            //     topicPattern: config.topicPattern || '',
            //     access: config.access || '',
            //     accessBehavior: config.accessBehavior || 'disable',
            // },
        });

        /*
         * This function is called when the node is being stopped, for example when a new flow configuration is deployed.
         */
        // `removed` is true only when the node is genuinely gone (deleted, or its tab
        // disabled). A plain redeploy passes false, and the cron jobs are left running
        // so the replacement node can adopt them.
        node.on('close', (removed, closeDone) => {
            if (RED.settings.verbose) {
                this.log(RED._('schedule.stopped'));
            }
            if (removed) {
                destroyCronJobs();
                clearTimeout(rt.orphanTimer);
                runtimes.delete(config.id);
                // last schedule node gone: retire the shared midnight rebuild too
                if (!runtimes.size && midnightJob) {
                    midnightJob.destroy();
                    midnightJob = null;
                }
            } else {
                clearTimeout(rt.heartbeatTimer);
                rt.heartbeatTimer = null;
                // Detach until the replacement node adopts this runtime; dispatch()
                // no-ops while node is null so jobs firing mid-deploy are dropped.
                rt.node = null;
                // Safety net: if no replacement arrives, this runtime is orphaned and
                // its cron jobs would run forever against a dead node.
                clearTimeout(rt.orphanTimer);
                rt.orphanTimer = setTimeout(() => {
                    if (!rt.node) {
                        destroyRuntimeJobs(rt);
                        runtimes.delete(config.id);
                    }
                }, 30000);
                if (rt.orphanTimer.unref) {
                    rt.orphanTimer.unref();
                }
            }
            done();
            closeDone();
        });
    }
    RED.nodes.registerType('ur_schedule', ScheduleNode);

    function setCronTime(pattern, hour, minute, second) {
        let parts = pattern.split(/\s+/);
        let hasSeconds = parts.length === 6;
        if (hasSeconds && typeof second !== undefined) {
            parts[0] = second;
        }
        if (typeof minute !== undefined) {
            parts[hasSeconds ? 1 : 0] = minute;
        }
        if (typeof hour !== undefined) {
            parts[hasSeconds ? 2 : 1] = hour;
        }
        return parts.join(' ');
    }
};
