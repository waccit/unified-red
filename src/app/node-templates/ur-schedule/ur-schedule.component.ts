import { Component, ViewChild } from '@angular/core';
import { FullCalendarComponent, CalendarOptions, compareByFieldSpec } from '@fullcalendar/angular';
import { BaseNode } from '../ur-base-node';
import * as parser from 'cron-parser';
import { UrScheduleFormDialogComponent } from './ur-schedule-form-dialog.component';
import { WebSocketService, SnackbarService, NodeRedApiService } from '../../services';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-ur-schedule',
    templateUrl: './ur-schedule.component.html',
    styleUrls: ['./ur-schedule.component.sass'],
})
export class UrScheduleComponent extends BaseNode {
    @ViewChild('calendar', { static: false })
    calendarComponent: FullCalendarComponent;

    calendarOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,dayGridDay,listWeek'
        },
        events: [],
        editable: true,
        weekends: true,
         // Important: Bind all event handlers to UrScheduleComponent
        dateClick: this.handleDateClick.bind(this),
        eventClick: this.handleEventClick.bind(this),
        eventResize: this.handleEventResize.bind(this),
        eventDrop: this.handleEventDrop.bind(this),
    };

    dirty = false;

    constructor(
        protected webSocketService: WebSocketService,
        public dialog: MatDialog,
        private snackbar: SnackbarService,
        private red : NodeRedApiService
    ) {
        super(webSocketService);
    }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        console.log(this.data);
        this.calendarOptions.events = [
            ...this.buildWeekdaySchedules(),
            ...this.buildDateSchedules(),
            ...this.buildHolidaySchedules(),
        ];
    }

    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && data.msg.topic && typeof data.msg.payload !== 'undefined') {
        }
    }

    sortChronologically(scheduleArray) {
        return scheduleArray.sort((a, b) => {
            let hour = a.hour - b.hour;
            if (hour === 0) {
                return a.minute - b.minute;
            }
            return hour;
        });
    }

    buildWeekdaySchedules() {
        let events = [];
        if (this.data && this.data.weekdays) {
            let weekdaySchedules = [
                /* Sunday    */ [],
                /* Monday    */ [],
                /* Tuesday   */ [],
                /* Wednesday */ [],
                /* Thursday  */ [],
                /* Friday    */ [],
                /* Saturday  */ []
            ];
            for (let sch of this.data.weekdays) {
                try {
                    if (!isNaN(sch.weekday)) {
                        weekdaySchedules[ parseInt(sch.weekday) ].push(sch);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
            for (let i = 0; i < weekdaySchedules.length; i++) {
                try {
                    weekdaySchedules[i] = this.sortChronologically(weekdaySchedules[i]);
                    for (let j = 0; j < weekdaySchedules[i].length; j+=2) {
                        try {
                            let start = weekdaySchedules[i][j];
                            let end = weekdaySchedules[i][j+1];
                            let weekday = parseInt(start.weekday);
                            let event = {
                                title: start.value,
                                allDay: false,
                                daysOfWeek: [ weekday ],
                                groupId: "weekday"+weekday, // assign each weekday to a group so changes to a weekday are repeated every week
                                startTime: `${ start.hour.padStart(2, "0") }:${ start.minute.padStart(2, "0") }:00`,
                                // if no end event was defined, then set end to end of day
                                endTime: end ? `${ end.hour.padStart(2, "0") }:${ end.minute.padStart(2, "0") }:00` : '23:59:59',
                                classNames: ["ur-schedule-weekday-event"],
                                schedule: { start: start, end: end, values: this.data.values, type: "weekday" }
                            };
                            events.push(event);
                        } catch (err) {
                            console.error(err);
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        }
        return events;
    }

    buildDateSchedules() {
        let events = [];
        if (this.data && this.data.dates) {
            let dateSchedules = {};
            let year = new Date().getFullYear(); // date schedules repeat annually. normalize all date schedules to current year
            for (let sch of this.data.dates) {
                try {
                    let d = new Date(sch.date);
                    d.setFullYear(new Date().getFullYear()); // normalize key to current year
                    let dateKey =  d.getTime();
                    if (!dateSchedules[dateKey]) {
                        dateSchedules[dateKey] = [];
                    }
                    dateSchedules[dateKey].push(sch);
                } catch (err) {
                    console.error(err);
                }
            }

            for (let dateKey in dateSchedules) {
                try {
                    dateSchedules[dateKey] = this.sortChronologically(dateSchedules[dateKey]);
                    for (let j = 0; j < dateSchedules[dateKey].length; j+=2) {
                        try {
                            let start = dateSchedules[dateKey][j];
                            let end = dateSchedules[dateKey][j+1];
                            let d = new Date(start.date);
                            let month = d.getMonth();
                            let date = d.getDate();
                            let event = {
                                title: start.value,
                                allDay: false,
                                start: new Date(year, month, date, start.hour, start.minute),
                                // if no end event was defined, then set end to end of day
                                end: end ? new Date(year, month, date, end.hour, end.minute) 
                                    : new Date(year, month, date, 23, 59, 59),
                                classNames: ["ur-schedule-date-event"],
                                schedule: { start: start, end: end, values: this.data.values, type: "date" }
                            };
                            events.push(event);
                        } catch (err) {
                            console.error(err);
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        }
        return events;
    }

    buildHolidaySchedules() {
        let events = [];
        let year = new Date().getFullYear();
        var options = {
            currentDate: new Date(year, 0, 1),
            endDate: new Date(year+1, 0, 1),
            iterator: true
        };

        if (this.data && this.data.holidays) {
            let holidaySchedules = {};
            for (let sch of this.data.holidays) {
                try {
                    let interval = parser.parseExpression(sch.pattern, options);
                    let nextEvent : any;
                    while (nextEvent = interval.next()) {
                        sch.date = nextEvent.value.toDate();
                        let d = nextEvent.value.toDate();
                        d.setHours(0, 0, 0, 0);
                        let dateKey =  d.getTime();
                        if (!holidaySchedules[dateKey]) {
                            holidaySchedules[dateKey] = [];
                        }
                        holidaySchedules[dateKey].push(sch);
                        if (nextEvent.done) {
                            break;
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            }

            for (let dateKey in holidaySchedules) {
                try {
                    holidaySchedules[dateKey] = this.sortChronologically(holidaySchedules[dateKey]);
                    for (let j = 0; j < holidaySchedules[dateKey].length; j+=2) {
                        try {
                            let start = holidaySchedules[dateKey][j];
                            let end = holidaySchedules[dateKey][j+1];
                            let d = new Date(start.date);
                            let month = d.getMonth();
                            let date = d.getDate();
                            let event = {
                                title: start.value,
                                allDay: false,
                                start: new Date(year, month, date, start.hour, start.minute),
                                // if no end event was defined, then set end to end of day
                                end: end ? new Date(year, month, date, end.hour, end.minute) 
                                    : new Date(year, month, date, 23, 59, 59),
                                classNames: ["ur-schedule-holiday-event"],
                                schedule: { start: start, end: end, values: this.data.values, type: "holiday" }
                            };
                            events.push(event);
                        } catch (err) {
                            console.error(err);
                        }
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        }
        return events;
    }

    handleDateClick(data) {
        console.log("handleDateClick", data);
        let dialogData = {
            data: { start: null, end: null, values: this.data.values, type: "weekday" },
            action: 'add'
        };
        // if click was on week grid, then assume the user wants to add a weekday schedule,
        // if click was on the day/month grid, then assume the user wants to add a date schedule. 
        switch (data.view.type) {
            case "timeGridWeek":
                dialogData.data.type = "weekday";
                dialogData.data.start = {
                    weekday: data.date.getDay(),
                    value: this.data.values[0]?.name,
                    hour: data.date.getHours(),
                    minute: data.date.getMinutes().toString().padStart(2, "0")
                };
                break;
            case "dayGridDay":
            case "dayGridMonth":
                dialogData.data.type = "date";
                dialogData.data.start = {
                    date: data.date.toString(),
                    value: this.data.values[0]?.name,
                    hour: data.date.getHours(),
                    minute: data.date.getMinutes().toString().padStart(2, "0")
                };
                break;
        }
        this.dialog
            .open(UrScheduleFormDialogComponent, { data: dialogData })
            .afterClosed()
            .subscribe((result) => {
                console.log("add response", result);
                if (result) {
                    this.dirty = true;
                    // this.roleService.update(row.level, result).subscribe(
                    //     (data) => {
                    //         this.snackbar.success('Added user successfully!');
                    //         this.refreshTable();
                    //     },
                    //     (error) => {
                    //         this.snackbar.error(error);
                    //     }
                    // );
                }
            });
    }

    handleEventClick(data) {
        console.log("handleEventClick", data);
        this.dialog
            .open(UrScheduleFormDialogComponent, { data: { data: data.event.extendedProps.schedule, action: 'edit' }})
            .afterClosed()
            .subscribe((result) => {
                console.log("edit response", result);
                if (result) {
                    this.dirty = true;
                    // this.roleService.update(row.level, result).subscribe(
                    //     (data) => {
                    //         this.snackbar.success('Edited role successfully!');
                    //         this.refreshTable();
                    //     },
                    //     (error) => {
                    //         this.snackbar.error(error);
                    //     }
                    // );
                }
            });
    }

    handleEventResize(data) {
        console.log("handleEventResize", data);
        this.dirty = true;
        // data.event.start;
        // data.event.end;
        // data.oldEvent.start;
        // data.oldEvent.end;
    }

    handleEventDrop(data) {
        console.log("handleEventDrop", data);
        this.dirty = true;
        // data.event;
        // data.oldEvent;
    }

    deploy() {
        this.red.deployNode(this.data).subscribe((reeponse: any) => {
            console.log("ur-schedule deploy", reeponse);
            if (reeponse?.rev) {
                this.snackbar.success('Deployed successfully!');
            }
        });
    }
}
