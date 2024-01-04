var cron = require('node-cron');
var parser = require('cron-parser');
var moment = require('moment');
var buildJob = null;

module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function ScheduleNode(config) {
        RED.nodes.createNode(this, config);
        this.holidays = RED.nodes.getNode(config.holidays).events;
        this.cronJobs = {}; // { job, event, type }
        this.heartbeatTimer = null;
        this.valuePriority = { holiday: null, date: null, weekday: null };
        var node = this;

        var { tab, group, page, folders } = ui.makeMenuTree(RED, config);

        /*
        HELPER FUNCTIONS
        */

        let setPrioritySchedule = function () {
            if (RED.settings.verbose) {
                node.log('setPrioritySchedule for ' + this.type);
            }
            node.valuePriority[this.type] = true; // just make the value non-falsy. Later an actual schedule value will be applied.
        };

        let clearPrioritySchedule = function () {
            if (RED.settings.verbose) {
                node.log('clearPrioritySchedule for ' + this.type);
            }
            node.valuePriority[this.type] = null;
        };

        let getValueFromName = function(value) {
            return config.values.find((v) => v.name === value);
        };

        let fireEvent = function () {
            if (this.event && this.type) {
                try {
                    // set value in priority object
                    node.valuePriority[this.type] = getValueFromName(this.event.value);
                    let value = undefined;

                    if (node.valuePriority.holiday) {
                        //prioritize holiday schedules over date schedules
                        if (this.type === 'holiday' && node.valuePriority.holiday.value) {
                            value = node.valuePriority.holiday.value;
                        }
                    } else if (node.valuePriority.date) {
                        //prioritize date schedules over weekday schedules
                        if (this.type === 'date' && node.valuePriority.date.value) {
                            value = node.valuePriority.date.value;
                        }
                    } else if (node.valuePriority.weekday) {
                        if (this.type === 'weekday' && node.valuePriority.weekday.value) {
                            value = node.valuePriority.weekday.value;
                        }
                    }

                    if (value) {
                        let next = nextEvent(this.type);
                        let nextState = getValueFromName(next.event.value).value;
                        let nextTimestamp = next.timestamp;
                        let payload = value;
                        if (config.payloadType && config.payloadType === 'tod') {
                            payload = {
                                'current_state': value,
                                'next_state': nextState,
                                'time_to_next_state': Math.floor((nextTimestamp - Date.now()) / 60000) /* minutes */
                            };
                        }
                        if (RED.settings.verbose) {
                            node.log(`fireEvent ${this.type} ${JSON.stringify(payload)}`);
                        }
                        heartbeatSend({ topic: config.topic, payload: payload });
                        node.status({ text: `now: ${value} [${this.type}],  next: ${nextState} @ ${new Date(nextTimestamp).toLocaleString()}` });
                    }
                } catch (err) {
                    node.error(err);
                }
            }
        };

        let heartbeatSend = function(msg) {
            try {
                node.send(msg);
                if (typeof msg !== undefined && typeof msg.payload !== undefined && 
                    typeof msg.payload.time_to_next_state !== undefined && msg.payload.time_to_next_state > 0) {
                    let heartbeatMins = 5; /* heartbeat in minutes */
                    let heartbeatMs = heartbeatMins * 60000; /* heartbeat in milliseconds */
                    let lasttime = msg.payload.time_to_next_state;
                    let topic = msg.topic;
                    let payload = msg.payload;
                    let heartbeatFunc = function() {
                        lasttime -= heartbeatMins;
                        let newMsg = { topic: topic, payload: payload }; // create new msg object
                        newMsg.payload.time_to_next_state = lasttime;
                        node.send(newMsg);
                        if (lasttime > 0) {
                            clearTimeout(node.heartbeatTimer);
                            node.heartbeatTimer = setTimeout(heartbeatFunc, heartbeatMs);
                        }
                    };
                    clearTimeout(node.heartbeatTimer);
                    node.heartbeatTimer = setTimeout(heartbeatFunc, heartbeatMs);
                }
            } catch (err) {
                node.error(err);
            }
        };

        let nextEvent = function(eventType) {
            let currentTime = Date.now();
            let nextFires = [];
            let typeNum = { 'holiday': 1, 'date': 2, 'weekday': 3 };
            for (let pattern in node.cronJobs) {
                try {
                    let nextFire = parser.parseExpression(pattern).next().toDate().getTime();
                    if (nextFire > currentTime) {
                        let cronJob = node.cronJobs[pattern];
                        if (typeof typeNum[cronJob.type] !== 'undefined') {
                            nextFires.push({
                                timestamp: nextFire, 
                                type: cronJob.type,
                                typeNum: typeNum[cronJob.type],
                                event: cronJob.event
                            });
                        }
                    }
                } catch (err) {
                    console.log('Error: ' + err.message);
                }
            }
            let sortedFireTimes = nextFires.sort((a, b) => a.timestamp - b.timestamp || a.typeNum - b.typeNum);
            let next = sortedFireTimes[0];
            // select next event based on event type
            for (let elem of sortedFireTimes) {
                if (elem.type === eventType) {
                    next = elem;
                    break;
                }
            }
            return next;
        };

        let prevEvent = function() {
            let currentTime = Date.now();
            let prevFires = [];
            let typeNum = { 'holiday': 1, 'date': 2, 'weekday': 3 };
            for (let pattern in node.cronJobs) {
                try {
                    let prevFire = parser.parseExpression(pattern).prev().toDate().getTime();
                    if (prevFire < currentTime) {
                        let cronJob = node.cronJobs[pattern];
                        if (typeof typeNum[cronJob.type] !== 'undefined') {
                            prevFires.push({
                                timestamp: prevFire,
                                type: cronJob.type,
                                typeNum: typeNum[cronJob.type],
                                event: cronJob.event
                            });
                        }
                    }
                } catch (err) {
                    console.log('Error: ' + err.message);
                }
            }
            let sortedFireTimes = prevFires.sort((a, b) => b.timestamp - a.timestamp || b.typeNum - a.typeNum);
            let prev = sortedFireTimes[0];
            return prev;
        };

        let secondsFromNow = function (x) {
            return new Date(new Date().getTime() + x * 1000); // in X seconds
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

        let isNthWeekday = function (weekdayExp) {
            let [day, week] = weekdayExp.split('#');
            let weekdays = explodeRange(day).split(',');
            for (let weekday of weekdays) {
                weekday = parseInt(weekday);
                let m = moment().date(week * 7 - 6); // go to nth week
                if (m.weekday() > weekday) {
                    m = m.add(7, 'days');
                }
                if (moment().diff(m.weekday(weekday), 'days') === 0) {
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

        let isLastDate = function () {
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
                    if (isLastDate()) {
                        // if the last day, overwrite date field with today
                        // console.log("scheduleHolidayJob lastDate");
                        pattern[3] = moment().date();
                        return pattern.join(' ');
                    }
                    return null;
                }
                if (weekday.indexOf('#') !== -1) {
                    if (isNthWeekday(weekday)) {
                        // if not the nth weekday, overwrite date field with today
                        // console.log("scheduleHolidayJob nth weekday");
                        pattern[5] = moment().day();
                        return pattern.join(' ');
                    }
                    return null;
                }
                if (weekday.indexOf('L') !== -1) {
                    if (isLastWeekday(weekday)) {
                        // if not the last weekday, overwrite date field with today
                        // console.log("scheduleHolidayJob last weekday");
                        pattern[5] = moment().day();
                        return pattern.join(' ');
                    }
                    return null;
                }
            }
            return schPattern;
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
                sch.pattern = setCronTime(sch.pattern, time.getHours(), time.getMinutes(), time.getSeconds());
            }
            let job = cron.schedule(sch.pattern, fireEvent.bind({ event: sch, type: 'holiday' }), {recoverMissedExecutions: true});
            node.cronJobs[sch.pattern] = { job: job, event: sch, type: 'holiday' };
        };

        let scheduleDateJob = function (sch, time) {
            if (RED.settings.verbose) {
                node.log('scheduleDateJob ' + JSON.stringify(sch) + ' ' + (time ? time.toLocaleString() : ''));
            }
            if (time) {
                sch.pattern = setCronTime(sch.pattern, time.getHours(), time.getMinutes(), time.getSeconds());
            }
            let job = cron.schedule(sch.pattern, fireEvent.bind({ event: sch, type: 'date' }), {recoverMissedExecutions: true});
            node.cronJobs[sch.pattern] = { job: job, event: sch, type: 'date' };
        };

        let scheduleWeekdayJob = function (sch, time) {
            if (RED.settings.verbose) {
                node.log('scheduleWeekdayJob ' + JSON.stringify(sch) + ' ' + (time ? time.toLocaleString() : ''));
            }
            if (time) {
                sch.pattern = setCronTime(sch.pattern, time.getHours(), time.getMinutes(), time.getSeconds());
            }
            let job = cron.schedule(sch.pattern, fireEvent.bind({ event: sch, type: 'weekday' }), {recoverMissedExecutions: true});
            node.cronJobs[sch.pattern] = { job: job, event: sch, type: 'weekday' };
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
                time ? time.getSeconds() : 0
            );
            let startJob = cron.schedule(startPattern, setPrioritySchedule.bind({ event: sch, type: type }), {recoverMissedExecutions: true});
            node.cronJobs[startPattern] = { job: startJob, event: sch, type: 'background' };
            // deactivate date or holiday schedule at end of day
            let endPattern = setCronTime(sch.pattern, 23, 59, 59);
            let endJob = cron.schedule(endPattern, clearPrioritySchedule.bind({ event: sch, type: type }), {recoverMissedExecutions: true});
            node.cronJobs[endPattern] = { job: endJob, event: sch, type: 'background' };
        };

        let destroyCronJobs = function() {
            clearTimeout(node.heartbeatTimer);
            try {
                for (let pattern in node.cronJobs) {
                    node.cronJobs[pattern].job.stop();
                }
            } catch (e) {
                node.error(e);
            }
            node.cronJobs = {};
        };

        /*
        SCHEDULE MAGIC
        */

        let buildSchedules = function () {
            node.log('Building schedules...');

            // stop and delete any existing cron jobs
            destroyCronJobs();

            // build map of all holiday events and index by cron pattern
            if (node.holidays && node.holidays.length) {
                for (let holidaySch of node.holidays) {
                    try {
                        // schedule job and "priority schedule" jobs
                        holidaySch._pattern = holidaySch.pattern;
                        holidaySch.pattern = setCronTime(holidaySch.pattern, holidaySch.hour, holidaySch.minute, '1');
                        scheduleHolidayJob(holidaySch);
                        schedulePriorityScheduleJobs(holidaySch, 'holiday');

                        // schedule recovery job: since we don't know if we're currently in a holiday,
                        // fire recovery for all holidays. Only today's holiday will fire anyways.
                        let scheduledTime = new Date();
                        scheduledTime.setHours(holidaySch.hour, holidaySch.minute, 0, 0);
                        if (new Date() > scheduledTime) {
                            scheduleHolidayJob(holidaySch, secondsFromNow(5));
                        }
                        schedulePriorityScheduleJobs(holidaySch, 'holiday', secondsFromNow(2));
                    } catch (err) {
                        node.error(err);
                    }
                }
            }

            // build map of all date events and index by date
            if (config.dates && config.dates.length) {
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
                        dateSch.pattern = ['1', dateSch.minute, dateSch.hour, d.getDate(), d.getMonth() + 1, '*'].join(
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
            if (config.weekdays && config.weekdays.length) {
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

            // schedule recovery job: find last (missed event) and fire after 5 second delay
            let lastEvent = prevEvent();
            if (lastEvent) {
                if (lastEvent.type === 'holiday') {
                    scheduleHolidayJob(lastEvent.event, secondsFromNow(5));
                    schedulePriorityScheduleJobs(lastEvent.event, 'holiday', secondsFromNow(2));
                }
                else if (lastEvent.type === 'date') {
                    scheduleDateJob(lastEvent.event, secondsFromNow(5));
                    schedulePriorityScheduleJobs(lastEvent.event, 'date', secondsFromNow(2));
                }
                else {
                    fireEvent.bind({ event: lastEvent.event, type: lastEvent.type })();
                }
            }
        };

        buildSchedules();
        // rebuild schedules everyday at midnight
        if (!buildJob) {
            buildJob = cron.schedule('0 0 0 * * *', buildSchedules, {recoverMissedExecutions: true});
        }

        this.config = {
            ...config,
            id: config.id,
            type: 'schedule',
            label: config.label,
            order: config.order,
            width: config.width || group.config.width || 12,
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
            //     width: config.width || group.config.width || 12,
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
        node.on('close', () => {
            // tear down all cron jobs
            if (RED.settings.verbose) {
                this.log(RED._('schedule.stopped'));
            }
            destroyCronJobs();
            done();
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
