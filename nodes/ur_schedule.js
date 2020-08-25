var cron = require('node-cron');
var buildJob = null;

module.exports = function (RED) {
    var ui = require('../ui')(RED);

    function ScheduleNode(config) {
        RED.nodes.createNode(this, config);
        this.holidays = RED.nodes.getNode(config.holidays).events;
        this.cronJobs = [];
        this.valuePriority = { holiday: null, date: null, weekday: null };
        var node = this;

        var group = RED.nodes.getNode(config.group);
        if (!group) {
            return;
        }
        var subtab = RED.nodes.getNode(group.config.subtab);
        if (!subtab) {
            return;
        }
        var tab = RED.nodes.getNode(subtab.config.tab);
        if (!tab) {
            return;
        }

        /*
        HELPER FUCTIONS
        */

        let setPrioritySchedule = function() {
            if (RED.settings.verbose) { 
                node.log("setPrioritySchedule for " + this.type);
            }
            node.valuePriority[this.type] = true; // just make the value non-falsy. Later an actual schedule value will be applied.
        };

        let clearPrioritySchedule = function() {
            if (RED.settings.verbose) { 
                node.log("clearPrioritySchedule for " + this.type);
            }
            node.valuePriority[this.type] = null;
        };

        let fireEvent = function() {
            if (this.event && this.type) {
                try {
                    // set value in priority object
                    let value = this.event.value;
                    node.valuePriority[this.type] = config.values.find(v => v.name === value);

                    if (node.valuePriority.holiday) { //prioritize holiday schedules over date schedules
                        if (this.type === 'holiday' && node.valuePriority.holiday.value) {
                            if (RED.settings.verbose) { 
                                node.log("fireEvent " + this.type + " " + JSON.stringify(node.valuePriority.holiday));
                            }
                            node.send({ topic: config.topic, payload: node.valuePriority.holiday.value });
                        }
                    }
                    else if (node.valuePriority.date) { //prioritize date schedules over weekday schedules
                        if (this.type === 'date' && node.valuePriority.date.value) {
                            if (RED.settings.verbose) { 
                                node.log("fireEvent " + this.type + " " + JSON.stringify(node.valuePriority.date));
                            }
                            node.send({ topic: config.topic, payload: node.valuePriority.date.value });
                        }
                    }
                    else if (node.valuePriority.weekday) {
                        if (this.type === 'weekday' && node.valuePriority.weekday.value) {
                            if (RED.settings.verbose) { 
                                node.log("fireEvent " + this.type + " " + JSON.stringify(node.valuePriority.weekday));
                            }
                            node.send({ topic: config.topic, payload: node.valuePriority.weekday.value });
                        }
                    }
                } catch(err) {
                    node.error(err);
                }
            }
        };

        let getLastFiredEvent = function(schedule) {
            if (!schedule) {
                return null;
            }
            let now = new Date().getTime();
            let possibleEvents = schedule.filter(sch => {
                try {
                    let time = new Date();
                    time.setHours(sch.hour, sch.minute, 0, 0);
                    return now >= time.getTime();
                } catch (ignore) {}
                return false;
            }).sort((a, b) => {
                let hour = a.hour - b.hour;
                if (hour === 0) {
                    return a.minute - b.minute;
                }
                return hour;
            });
            // pick the event closest to now
            let event = possibleEvents.length ? possibleEvents[possibleEvents.length-1] : null;
            return event;
        }

        let secondsFromNow = function(x) {
            return new Date(new Date().getTime() + x * 1000); // in X seconds
        };

        let scheduleHolidayJob = function(sch, time) {
            if (RED.settings.verbose) { 
                node.log("scheduleHolidayJob " + JSON.stringify(sch) + " " + (time ? time.toLocaleString() : ''));
            }
            if (time) {
                sch.pattern = setCronTime(sch.pattern, time.getHours(), time.getMinutes(), time.getSeconds());
            }
            let job = cron.schedule(sch.pattern, fireEvent.bind({ event: sch, type: "holiday" }));
            node.cronJobs.push(job);
        };

        let scheduleDateJob = function(sch, time) {
            if (RED.settings.verbose) { 
                node.log("scheduleDateJob " + JSON.stringify(sch) + " " + (time ? time.toLocaleString() : ''));
            }
            if (time) {
                sch.pattern = setCronTime(sch.pattern, time.getHours(), time.getMinutes(), time.getSeconds());
            }
            let job = cron.schedule(sch.pattern, fireEvent.bind({ event: sch, type: "date" }));
            node.cronJobs.push(job);
        };

        let scheduleWeekdayJob = function(sch, time) {
            if (RED.settings.verbose) { 
                node.log("scheduleWeekdayJob " + JSON.stringify(sch) + " " + (time ? time.toLocaleString() : ''));
            }
            if (time) {
                sch.pattern = setCronTime(sch.pattern, time.getHours(), time.getMinutes(), time.getSeconds());
            }
            let job = cron.schedule(sch.pattern, fireEvent.bind({ event: sch, type: "weekday" }));
            node.cronJobs.push(job);
        };

        let schedulePriorityScheduleJobs = function(sch, type, time) {
            // activate date or holiday schedule at beginning of day (unless time overriden)
            let startPattern = setCronTime(sch.pattern, time ? time.getHours() : 0, time ? time.getMinutes() : 0, time ? time.getSeconds() : 0);
            let startJob = cron.schedule(startPattern, setPrioritySchedule.bind({ event: sch, type: type }));
            node.cronJobs.push(startJob);
            // deactivate date or holiday schedule at end of day
            let endPattern = setCronTime(sch.pattern, 23, 59, 59);
            let endJob = cron.schedule(endPattern, clearPrioritySchedule.bind({ event: sch, type: type }));
            node.cronJobs.push(endJob);
        };

        /*
        SCHEDULE MAGIC
        */

        let buildSchedules = function() {
            node.log("Building schedules...");
            
            // stop and delete any existing cron jobs
            try {
                for (let job of node.cronJobs) {
                    job.destroy();
                }
            } catch (e) {
                node.error(e);
            }
            node.cronJobs = [];

            // build map of all holiday events and index by cron pattern
            if (node.holidays && node.holidays.length) {
                for (let holidaySch of node.holidays) {
                    try {
                        // schedule job and "priority schedule" jobs
                        holidaySch._pattern = holidaySch.pattern;
                        holidaySch.pattern = setCronTime(holidaySch.pattern, holidaySch.hour, holidaySch.minute, '0');
                        scheduleHolidayJob(holidaySch);
                        schedulePriorityScheduleJobs(holidaySch, "holiday");

                        // schedule recovery job: since we don't know if we're currently in a holiday, 
                        // fire recovery for all holidays. Only today's holiday will fire anyways.
                        let scheduledTime = new Date();
                        scheduledTime.setHours(holidaySch.hour,holidaySch.minute,0,0);
                        if (new Date() > scheduledTime) {
                            scheduleHolidayJob(holidaySch, secondsFromNow(5));
                        }
                        schedulePriorityScheduleJobs(holidaySch, "holiday", secondsFromNow(2));
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
                        let dateKey =  d.getTime();
                        if (!dateSchedules[dateKey]) {
                            dateSchedules[dateKey] = [];
                        }
                        dateSchedules[dateKey].push(dateSch);

                        // schedule job and "priority schedule" jobs
                        dateSch.pattern = ["0", dateSch.minute, dateSch.hour, d.getDate(), d.getMonth()+1, "*"].join(" ");
                        scheduleDateJob(dateSch);
                        schedulePriorityScheduleJobs(dateSch, "date");
                    } catch (err) {
                        node.error(err);
                    }
                }
                // schedule recovery job: find last (missed event) and fire after 5 second delay
                let today = new Date();
                today.setHours(0,0,0,0);
                let lastEvent = getLastFiredEvent(dateSchedules[ today.getTime() ]);
                if (lastEvent !== null) {
                    scheduleDateJob(lastEvent, secondsFromNow(5));
                    schedulePriorityScheduleJobs(lastEvent, "date", secondsFromNow(2));
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
                    /* Saturday  */ []
                ];
                for (let weekdaySch of config.weekdays) {
                    try {
                        if (!isNaN(weekdaySch.weekday)) {
                            // catalog weekday schedules to later find last (missed) event
                            weekdaySchedules[ parseInt(weekdaySch.weekday) ].push(weekdaySch);

                            // schedule job
                            weekdaySch.pattern = ["0", weekdaySch.minute, weekdaySch.hour, "*", "*", weekdaySch.weekday].join(" ");
                            scheduleWeekdayJob(weekdaySch);
                        }
                    } catch (err) {
                        node.error(err);
                    }
                }
                // schedule recovery job: find last (missed event) and fire after 5 second delay
                let today = new Date();
                let lastEvent = getLastFiredEvent(weekdaySchedules[ today.getDay() ]);
                if (lastEvent !== null) {
                    scheduleWeekdayJob(lastEvent, secondsFromNow(5));
                }
            }
        };

        buildSchedules();
        // rebuild schedules everyday at midnight
        if (!buildJob) {
            buildJob = cron.schedule("0 0 0 * * *", buildSchedules);
        }

        var done = ui.add({
            emitOnlyNewValues: false,
            node: node,
            tab: tab,
            subtab: subtab,
            group: group,
            control: {
                id: config.id,
                type: 'schedule',
                label: config.label,
                order: config.order,
                width: config.width || group.config.width || 12,
                values: config.values,
                weekdays: config.weekdays,
                dates: config.dates,
                holidays: this.holidays
            }
        });

        /*
        * This function is called when the node is being stopped, for example when a new flow configuration is deployed.
        */
        node.on('close', () => {
            // tear down all cron jobs
            if (RED.settings.verbose) {
                this.log(RED._("schedule.stopped"));
            }
            for (let job of this.cronJobs) {
                job.destroy();
            }
            this.cronJobs = [];
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
