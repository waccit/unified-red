import { Component, ViewChild, AfterViewInit, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FullCalendarComponent, CalendarOptions, render } from '@fullcalendar/angular';
import * as parser from 'cron-parser';
import * as moment from 'moment';
import { BaseNode } from '../ur-base-node';
import { UrScheduleFormDialogComponent } from './ur-schedule-form-dialog.component';
import { WebSocketService, SnackbarService, NodeRedApiService, CurrentUserService, RoleService } from '../../services';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { StyleService } from '../../services/style.service';

declare const $: any;

@Component({
    selector: 'app-ur-schedule',
    templateUrl: './ur-schedule.component.html',
    styleUrls: ['./ur-schedule.component.sass'],
})
export class UrScheduleComponent extends BaseNode implements AfterViewInit {
    @ViewChild('calendar', { static: false })
    calendarComponent: FullCalendarComponent;

    calendarOptions: CalendarOptions = {
        headerToolbar: this.isMobile()
            ? { left: '', center: 'title', right: '' } // mobile
            : { left: 'prev,next', center: 'title', right: 'dayGridMonth,timeGridWeek,dayGridDay' }, //desktop
        footerToolbar: this.isMobile() ? { left: 'prev,next', right: 'dayGridMonth,timeGridWeek,dayGridDay' } : false,
        views: {
            timeGridWeek: {
                allDaySlot: false,
            },
        },
        slotLabelFormat: {
            hour: 'numeric',
            minute: '2-digit',
            meridiem: false,
            hour12: false,
        },
        eventTimeFormat: {
            hour: 'numeric',
            minute: '2-digit',
            meridiem: false,
            hour12: false,
        },
        events: [],
        editable: true,
        weekends: true,
        // Important: Bind all event handlers to UrScheduleComponent
        dateClick: this.handleDateClick.bind(this),
        eventClick: this.handleEventClick.bind(this),
        eventChange: this.handleEventChange.bind(this),
        datesSet: this.renderDateRange.bind(this),
        viewClassNames: this.saveCurrentViewType.bind(this),
    };

    dirty = false;
    mobile = undefined;

    private calendarReady = new BehaviorSubject<boolean>(false);

    constructor(
        protected webSocketService: WebSocketService,
        protected currentUserService: CurrentUserService,
        protected roleService: RoleService,
        protected snackbar: SnackbarService,
        public dialog: MatDialog,
        private red: NodeRedApiService,
        protected styleService: StyleService,
        protected renderer: Renderer2
    ) {
        super(webSocketService, currentUserService, roleService, snackbar, styleService, renderer);
    }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.setupScheduleAccess();
        this.calendarReady
            .asObservable()
            .pipe(debounceTime(150), distinctUntilChanged())
            .subscribe(() => {
                this.calendarLoadSchedules();
                this.setViewType();
            });
    }
    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && data.msg.topic && typeof data.msg.payload !== 'undefined') {
        }
    }

    private saveCurrentViewType() {
        if (this.calendarComponent) {
            let currentViewType = this.calendarComponent.getApi().currentData.currentViewType;
            localStorage.setItem(`fcInitialView-${this.getBaseNodeId(this.data.id)}`, currentViewType);
        }
    }

    private setViewType() {
        // Get locally stored view type
        let viewType = localStorage.getItem(`fcInitialView-${this.getBaseNodeId(this.data.id)}`);

        // Default view if there's no stored view
        if (!viewType) {
            switch (this.data.defaultView) {
                case '1':
                    viewType = 'dayGridMonth';
                    break;

                case '2':
                    viewType = 'timeGridWeek';
                    break;

                case '3':
                    viewType = 'dayGridDay';
                    break;

                default:
                    viewType = 'dayGridMonth';
                    break;
            }
        }
        this.calendarComponent.getApi().changeView(viewType);
    }

    private sortChronologically(scheduleArray) {
        return scheduleArray.sort((a, b) => {
            const hour = a.hour - b.hour;
            if (hour === 0) {
                return a.minute - b.minute;
            }
            return hour;
        });
    }

    private calendarLoadSchedules() {
        this.calendarOptions.events = [
            ...this.buildWeekdaySchedules(),
            ...this.buildDateSchedules(),
            ...this.buildHolidaySchedules(),
        ];
        this.renderInactiveEvents();
    }

    private buildWeekdaySchedules() {
        const events = [];
        if (this.data && this.data.weekdays) {
            const weekdaySchedules = [
                /* Sunday    */ [],
                /* Monday    */ [],
                /* Tuesday   */ [],
                /* Wednesday */ [],
                /* Thursday  */ [],
                /* Friday    */ [],
                /* Saturday  */ [],
            ];
            for (const sch of this.data.weekdays) {
                try {
                    if (!isNaN(sch.weekday)) {
                        weekdaySchedules[parseInt(sch.weekday, 10)].push(sch);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
            for (const weekdaySch of weekdaySchedules) {
                try {
                    this.sortChronologically(weekdaySch);
                    for (let j = 0; j < weekdaySch.length; j += 1) {
                        try {
                            const start = weekdaySch[j];
                            const end = weekdaySch[j + 1];
                            const weekday = parseInt(start.weekday, 10);
                            const event = {
                                title: start.value,
                                allDay: false,
                                daysOfWeek: [weekday],
                                groupId: 'weekday' + weekday, // assign each weekday to a group so changes
                                // to a weekday are repeated every week
                                startTime: `${start.hour.padStart(2, '0')}:${start.minute.padStart(2, '0')}:00`,
                                // if no end event was defined, then set end to end of day
                                endTime: end
                                    ? `${end.hour.padStart(2, '0')}:${end.minute.padStart(2, '0')}:00`
                                    : '23:59:59',
                                classNames: ['ur-schedule-weekday-event'],
                                schedule: { start, end, values: this.data.values, type: 'weekday' },
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

    private buildDateSchedules() {
        const events = [];
        if (this.data && this.data.dates) {
            const dateSchedules = {};
            const year = new Date().getFullYear(); // date schedules repeat annually. normalize all date schedules to current year
            for (const sch of this.data.dates) {
                try {
                    const d = new Date(sch.date);
                    d.setFullYear(new Date().getFullYear()); // normalize key to current year
                    const dateKey = d.getTime();
                    if (!dateSchedules[dateKey]) {
                        dateSchedules[dateKey] = [];
                    }
                    dateSchedules[dateKey].push(sch);
                } catch (err) {
                    console.error(err);
                }
            }

            for (const dateKey in dateSchedules) {
                if (dateSchedules.hasOwnProperty(dateKey)) {
                    try {
                        this.sortChronologically(dateSchedules[dateKey]);
                        for (let j = 0; j < dateSchedules[dateKey].length; j += 1) {
                            try {
                                const start = dateSchedules[dateKey][j];
                                const end = dateSchedules[dateKey][j + 1];
                                const d = new Date('2001/' + start.date);
                                const month = d.getMonth();
                                const date = d.getDate();
                                const event = {
                                    title: start.value,
                                    allDay: false,
                                    start: new Date(year, month, date, start.hour, start.minute),
                                    // if no end event was defined, then set end to end of day
                                    end: end
                                        ? new Date(year, month, date, end.hour, end.minute)
                                        : new Date(year, month, date, 23, 59, 59),
                                    classNames: ['ur-schedule-date-event'],
                                    schedule: { start, end, values: this.data.values, type: 'date' },
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
        }
        return events;
    }

    private buildHolidaySchedules() {
        const events = [];
        const today = new Date();
        const year = today.getFullYear();
        const parserStartDate = new Date(year - 1, today.getMonth(), today.getDate());
        const parserEndDate = new Date(year + 1, today.getMonth(), today.getDate());

        if (this.data && this.data.holidays) {
            const holidaySchedules = {};
            for (const holidaySch of this.data.holidays) {
                try {
                    const interval = parser.parseExpression(holidaySch.pattern, {
                        currentDate: parserStartDate,
                        endDate: parserEndDate,
                        iterator: true,
                    });
                    let nextEvent: any = interval.next();
                    while (nextEvent) {
                        const sch = { ...holidaySch }; // clone schedule
                        sch.date = nextEvent.value.toDate();
                        const d = nextEvent.value.toDate();
                        d.setHours(0, 0, 0, 0);
                        const dateKey = d.getTime();
                        if (!holidaySchedules[dateKey]) {
                            holidaySchedules[dateKey] = [];
                        }
                        holidaySchedules[dateKey].push(sch);
                        if (nextEvent.done) {
                            break;
                        }
                        nextEvent = interval.next();
                    }
                } catch (err) {
                    console.error(err);
                }
            }

            for (const dateKey in holidaySchedules) {
                if (holidaySchedules.hasOwnProperty(dateKey)) {
                    try {
                        this.sortChronologically(holidaySchedules[dateKey]);
                        for (let j = 0; j < holidaySchedules[dateKey].length; j += 1) {
                            try {
                                const start = holidaySchedules[dateKey][j];
                                const end = holidaySchedules[dateKey][j + 1];
                                const d = new Date(start.date);
                                const year = d.getFullYear();
                                const month = d.getMonth();
                                const date = d.getDate();
                                const event = {
                                    title: start.value,
                                    allDay: false,
                                    start: new Date(year, month, date, start.hour, start.minute),
                                    // if no end event was defined, then set end to end of day
                                    end: end
                                        ? new Date(year, month, date, end.hour, end.minute)
                                        : new Date(year, month, date, 23, 59, 59),
                                    classNames: ['ur-schedule-holiday-event'],
                                    schedule: { start, end, values: this.data.values, type: 'holiday' },
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
        }
        return events;
    }

    private handleDateClick(data) {
        const dialogData = {
            data: { type: 'weekday', values: this.data.values, events: [] },
            action: 'add',
        };
        // If the calendar is clicked, populate fields accordingly
        if (data) {
            // if click was on week grid, then assume the user wants to add a weekday schedule,
            // if click was on the day/month grid, then assume the user wants to add a date schedule.
            switch (data.view.type) {
                case 'timeGridWeek':
                    dialogData.data.type = 'weekday';
                    dialogData.data.events.push({
                        weekday: data.date.getDay(),
                        value: this.data.values[0]?.name,
                        hour: data.date.getHours(),
                        minute: data.date.getMinutes().toString().padStart(2, '0'),
                    });
                    break;
                case 'dayGridDay':
                case 'dayGridMonth':
                    dialogData.data.type = 'date';
                    dialogData.data.events.push({
                        date: data.date.toString(),
                        value: this.data.values[0]?.name,
                        hour: data.date.getHours(),
                        minute: data.date.getMinutes().toString().padStart(2, '0'),
                    });
                    break;
            }
        }
        // If the add button is pressed, set fields to default (current date)
        else {
            let now = new Date();
            let nowDate = String(now.getMonth() + 1)
                .concat('/')
                .concat(String(now.getDate()));
            dialogData.data.type = 'date';
            dialogData.data.events.push({
                date: nowDate,
                value: this.data.values[0]?.name,
                hour: 0,
                minute: '00',
            });
        }

        this.dialog
            .open(UrScheduleFormDialogComponent, { data: dialogData })
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    this.dirty = true;
                    switch (result.type) {
                        case 'weekday':
                            this.addWeekdaySchedulesFromDialog(result);
                            break;
                        case 'date':
                            this.addDateSchedulesFromDialog(result);
                            break;
                        case 'holiday':
                            this.addHolidaySchedulesFromDialog(result);
                            break;
                    }
                    this.calendarLoadSchedules();
                }
            });
    }

    private handleEventClick(data) {
        const orig = data?.event?.extendedProps?.schedule;

        const dialogData = { type: orig.type, values: orig.values, events: [] };
        // collect all events for the selected weekday/date/holiday
        switch (orig?.type) {
            case 'weekday':
                dialogData.events = this.data.weekdays.filter((e) => e.weekday === orig.start.weekday);
                break;
            case 'date':
                dialogData.events = this.data.dates.filter((e) => e.date === orig.start.date);
                break;
            case 'holiday':
                const origCron = orig.start.pattern.split(' ');
                if (origCron.length >= 5) {
                    dialogData.events = this.data.holidays.filter((e) => {
                        const eCron = e.pattern.split(' ');
                        if (eCron.length < 5) {
                            return false;
                        }
                        return (
                            /* date */ eCron[3] === origCron[3] &&
                            /* month */ eCron[4] === origCron[4] &&
                            /* day */ eCron[5] === origCron[5]
                        );
                    });
                }
                break;
        }

        this.dialog
            .open(UrScheduleFormDialogComponent, { data: { data: dialogData, action: 'edit' } })
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    let updated = false;

                    const purgeOldEvent = (arr, prop) => {
                        const startLength = arr.length;
                        arr = arr.filter(
                            (sch) => sch[prop] !== orig.start[prop] && (!orig.end || sch[prop] !== orig.end[prop])
                        );
                        // if anything removed, flag updated
                        if (startLength !== arr.length) {
                            updated = true;
                        }
                        return arr;
                    };

                    // in all cases (edit or delete), remove original events
                    switch (orig?.type) {
                        case 'weekday':
                            this.data.weekdays = purgeOldEvent(this.data.weekdays, 'weekday');
                            break;
                        case 'date':
                            this.data.dates = purgeOldEvent(this.data.dates, 'date');
                            break;
                        case 'holiday':
                            this.data.holidays = purgeOldEvent(this.data.holidays, '_pattern');
                            break;
                    }

                    if (result.action === 'edit') {
                        // add new events returned from dialog
                        switch (result.type) {
                            case 'weekday':
                                if (this.addWeekdaySchedulesFromDialog(result)) {
                                    updated = true;
                                }
                                break;
                            case 'date':
                                if (this.addDateSchedulesFromDialog(result)) {
                                    updated = true;
                                }
                                break;
                            case 'holiday':
                                if (this.addHolidaySchedulesFromDialog(result)) {
                                    updated = true;
                                }
                                break;
                        }
                    }

                    if (updated) {
                        this.dirty = true;
                        this.calendarLoadSchedules();
                    }
                }
            });
    }

    private handleEventChange(fc) {
        let updated = false;

        const orig = fc.oldEvent?.extendedProps?.schedule;
        if (orig?.type === 'weekday') {
            for (const sch of this.data.weekdays) {
                if (this.isWeekdayScheduleMatch(sch, orig.start)) {
                    this.updateWeekdaySchedule(sch, fc.event.start);
                    updated = true;
                } else if (this.isWeekdayScheduleMatch(sch, orig.end)) {
                    this.updateWeekdaySchedule(sch, fc.event.end);
                    updated = true;
                }
            }
        } else if (orig?.type === 'date') {
            for (const sch of this.data.dates) {
                if (this.isDateScheduleMatch(sch, orig.start)) {
                    this.updateDateSchedule(sch, fc.event.start);
                    updated = true;
                } else if (this.isDateScheduleMatch(sch, orig.end)) {
                    this.updateDateSchedule(sch, fc.event.end);
                    updated = true;
                }
            }
        } else if (orig?.type === 'holiday') {
            if (moment(fc.event.start).diff(moment(fc.oldEvent.start), 'days') !== 0) {
                // holiday event dragged onto different day
                console.error("Cannot drag holiday to a different day. Please edit the holiday's repeat rule.");
                fc.revert();
                return;
            }
            for (const sch of this.data.holidays) {
                if (this.isHolidayScheduleMatch(sch, orig.start)) {
                    this.updateHolidaySchedule(sch, fc.event.start);
                    updated = true;
                } else if (this.isHolidayScheduleMatch(sch, orig.end)) {
                    this.updateHolidaySchedule(sch, fc.event.end);
                    updated = true;
                }
            }
        }
        if (updated) {
            this.dirty = true;
            this.calendarLoadSchedules();
        }
    }

    deploy() {
        const baseNodeId = this.getBaseNodeId(this.data.id);
        const baseHolidayNodeId = this.getBaseNodeId(this.data.holidaysId);
        const nodesToReplace = [baseNodeId, baseHolidayNodeId];
        this.red
            .deployNodes(nodesToReplace, (existing) => {
                switch (existing.id) {
                    case baseHolidayNodeId:
                        existing.events = this.data.holidays;
                        break;
                    case baseNodeId:
                        existing.dates = this.data.dates;
                        existing.weekdays = this.data.weekdays;
                        break;
                }
                return existing;
            })
            .subscribe((response: any) => {
                if (response?.rev) {
                    this.snackbar.success('Deployed successfully!');
                }
            });
        this.send({
            payload: {},
            point: 'Schedule',
        });
    }

    private renderDateRange() {
        this.renderInactiveEvents();
    }

    private renderInactiveEvents() {
        setTimeout(() => {
            // clear any previous inactive flags
            $('.ur-schedule-weekday-event.inactive, .ur-schedule-date-event.inactive').removeClass('inactive');

            const events = $('.fc-timegrid-col, .fc-daygrid-day');
            // within week or month/day view, check for any events with weekday and
            // date/holiday schedules and flag weekday events as inactive
            events
                .has('.ur-schedule-weekday-event')
                .has('.ur-schedule-date-event, .ur-schedule-holiday-event')
                .find('.ur-schedule-weekday-event')
                .addClass('inactive');

            // within week or month/day view, check for any events with date and
            // holiday schedules and flag date events as inactive
            events
                .has('.ur-schedule-date-event')
                .has('.ur-schedule-holiday-event')
                .find('.ur-schedule-date-event')
                .addClass('inactive');
        }, 50); // short delay to allow DOM to complete rendering in certain edge cases
    }

    private addWeekdaySchedulesFromDialog(result) {
        let added = false;
        for (const event of result.events) {
            const weekday = parseInt(result.weekday, 10);
            let weekdays = [weekday];
            if (result.addTo) {
                switch (result.addTo) {
                    case 'everyday':
                        weekdays = [0, 1, 2, 3, 4, 5, 6];
                        break;
                    case 'm-f':
                        weekdays = [...new Set([1, 2, 3, 4, 5, weekday])];
                        break;
                    case 'tu-f':
                        weekdays = [...new Set([2, 3, 4, 5, weekday])];
                        break;
                    case 'sa-su':
                        weekdays = [...new Set([0, 6, weekday])];
                        break;
                }
            }
            for (const w of weekdays) {
                const date = moment().day(w).hour(event.hour).minute(event.minute);
                let sch = { weekday: '', value: event.value, hour: '', minute: '', pattern: '' };
                sch = this.updateWeekdaySchedule(sch, date);
                this.data.weekdays.push(sch);
                added = true;
            }
        }
        return added;
    }

    private addDateSchedulesFromDialog(result) {
        let added = false;
        for (const event of result.events) {
            const date = result.date;
            date.hour(event.hour).minute(event.minute);
            let sch = { date: '', value: event.value, hour: '', minute: '', pattern: '' };
            sch = this.updateDateSchedule(sch, date);
            this.data.dates.push(sch);
            added = true;
        }
        return added;
    }

    private addHolidaySchedulesFromDialog(result) {
        let added = false;
        for (const event of result.events) {
            const pattern = result.holiday;
            const name = this.buildHolidayName(result);
            const date = moment().hour(event.hour).minute(event.minute);
            const sch = this.updateHolidaySchedule(
                {
                    name,
                    value: event.value,
                    hour: '',
                    minute: '',
                    pattern,
                },
                date
            );
            this.data.holidays.push(sch);
            added = true;
        }
        return added;
    }

    private updateWeekdaySchedule(sch, dateObj) {
        const date = moment(dateObj);
        sch.weekday = date.format('d');
        sch.hour = date.format('H');
        sch.minute = date.format('m');
        sch.pattern = date.format('0 m H * * d');
        console.log('sch', sch);
        return sch;
    }

    private updateDateSchedule(sch, dateObj) {
        console.log('sch', sch);
        const date = moment(dateObj);
        sch.date = date.format('MM/DD');
        sch.hour = date.format('H');
        sch.minute = date.format('mm');
        // here
        sch.pattern = date.format('0 m H D M *');
        return sch;
    }

    private updateHolidaySchedule(sch, dateObj) {
        const date = moment(dateObj);
        sch.hour = date.format('H');
        sch.minute = date.format('m');
        sch.pattern = date.format('0 m H ') + sch.pattern.split(' ').slice(3).join(' ');
        sch._pattern = '0 * * ' + sch.pattern.split(' ').slice(3).join(' ');
        return sch;
    }

    private buildHolidayName(result) {
        const nth = [
            { value: '1', text: '1st' },
            { value: '2', text: '2nd' },
            { value: '3', text: '3rd' },
            { value: '4', text: '4th' },
            { value: '5', text: '5th' },
            // { value: 'L', text: 'Last' },
        ];
        const arr = (a) => {
            return Array.isArray(a) ? a : [a];
        };

        if (result) {
            const m = moment();
            if (result.repeat === 'yearly') {
                if (result.repeatYearType === 'date') {
                    const month = arr(result.repeatYearMonth)
                        .map((w) => m.month(parseInt(w, 10) - 1).format('MMM'))
                        .join(', ');
                    const date = arr(result.repeatYearDate).join(',');
                    return `${month} ${date}`;
                } else if (result.repeatYearType === 'weekday') {
                    const month = m.month(parseInt(result.repeatYearMonth, 10) - 1).format('MMM');
                    const weekday = m.weekday(result.repeatYearWeekday).format('ddd');
                    const occ = nth.filter((i) => i.value === result.repeatYearWeekdayOccurrence)[0].text;
                    return `${occ} ${weekday} of ${month}`;
                }
            } else if (result.repeat === 'monthly') {
                if (result.repeatMonthType === 'date') {
                    const date = arr(result.repeatMonthDate).join(',');
                    return `Day ${date} of every month`;
                } else if (result.repeatMonthType === 'weekday') {
                    const weekday = m.weekday(result.repeatMonthWeekday).format('ddd');
                    const occ = nth.filter((i) => i.value === result.repeatMonthWeekdayOccurrence)[0].text;
                    return `${occ} ${weekday} of every month`;
                }
            } else if (result.repeat === 'weekly') {
                const weekday = arr(result.repeatWeekdays)
                    .map((w) => m.weekday(w).format('ddd'))
                    .join(', ');
                return `Every ${weekday}`;
            }
            return result.repeat + ' ' + result.holiday.split(' ').slice(3).join(' ');
        }
        return 'Unknown';
    }

    private isScheduleMatch(a, b) {
        return !!a && !!b && a.hour === b.hour && a.minute === b.minute && a.value === b.value;
    }

    private isWeekdayScheduleMatch(a, b) {
        return a?.weekday === b?.weekday && this.isScheduleMatch(a, b);
    }

    private isDateScheduleMatch(a, b) {
        return a?.date === b?.date && this.isScheduleMatch(a, b);
    }

    private isHolidayScheduleMatch(a, b) {
        return a?._pattern === b?._pattern && this.isScheduleMatch(a, b);
    }

    private isMobile() {
        if (this.mobile === undefined) {
            let a = navigator.userAgent || navigator.vendor || window['opera'];
            this.mobile =
                /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
                    a
                ) ||
                /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                    a.substr(0, 4)
                );
        }
        return this.mobile;
    }

    private runTests() {
        const opt = {
            currentDate: new Date(2020, 0, 1),
            endDate: new Date(2021, 0, 1),
            iterator: true,
        };

        const tests = [
            // { cron: "0 0/30 14 * * *", desc: "Fire every 30 minutes starting at 2pm and ending at 2:59pm, every day" }, //passes
            // { cron: "0 0/30 14,18 * * *", desc:
            //      "Fire every 30 minutes starting at 2pm and ending at 2:59pm, AND at 6pm and ending at 6:59pm, every day" }, //passes
            // { cron: "0 0-5 14 * * *", desc: "Fire every minute starting at 2pm and ending at 2:05pm, every day" }, //passes
            // { cron: "0 10,44 14 * 3 3", desc: "Fire at 2:10pm and at 2:44pm every Wednesday in the month of March." }, //passes
            // { cron: "0 15 10 * * 1-5", desc: "Fire at 10:15am every Monday, Tuesday, Wednesday, Thursday and Friday" }, //passes
            // { cron: "0 15 10 15 * *", desc: "Fire at 10:15am on the 15th day of every month" }, //passes
            // { cron: "0 15 10 L * *", desc: "Fire at 10:15am on the last day of every month" }, //*** fails ***
            // { cron: "0 15 10 * * 5L", desc: "Fire at 10:15am on the last Friday of every month" }, //*** fails ***
            // { cron: "0 15 10 * * 5#3", desc: "Fire at 10:15am on the third Friday of every month" }, //passes
        ];

        for (const test of tests) {
            try {
                const interval = parser.parseExpression(test.cron, opt);
                let nextEvent: any = interval.next();
                let count = 0;
                while (nextEvent && count < 10) {
                    count++;
                    if (nextEvent.done || count >= 10) {
                        break;
                    }
                    nextEvent = interval.next();
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
}

/*
* (“all values”) - used to select all values within a field. For example, “*” in the minute field
means “every minute”.

- - used to specify ranges. For example, “10-12” in the hour field means “the hours 10, 11 and 12”.

, - used to specify additional values. For example, “MON,WED,FRI” in the day-of-week field means
“the days Monday, Wednesday, and Friday”.

/ - used to specify increments. For example, “0/15” in the seconds field means “the seconds 0, 15,
30, and 45”. And “5/15” in the seconds field means “the seconds 5, 20, 35, and 50”. You can also
specify ‘/’ after the ‘’ character - in this case ‘’ is equivalent to having ‘0’ before the ‘/’.
‘1/3’ in the day-of-month field means “fire every 3 days starting on the first day of the month”.

L (“last”) - has different meaning in each of the two fields in which it is allowed. For example,
the value “L” in the day-of-month field means “the last day of the month” - day 31 for January, day
28 for February on non-leap years. If used in the day-of-week field by itself, it simply means “7”
or “SAT”. But if used in the day-of-week field after another value, it means “the last xxx day of
the month” - for example “6L” means “the last friday of the month”. You can also specify an offset
from the last day of the month, such as “L-3” which would mean the third-to-last day of the calendar
month. When using the ‘L’ option, it is important not to specify lists, or ranges of values, as
you’ll get confusing/unexpected results.

W (“weekday”) - used to specify the weekday (Monday-Friday) nearest the given day. As an example,
if you were to specify “15W” as the value for the day-of-month field, the meaning is: “the nearest
weekday to the 15th of the month”. So if the 15th is a Saturday, the trigger will fire on Friday
the 14th. If the 15th is a Sunday, the trigger will fire on Monday the 16th. If the 15th is a
Tuesday, then it will fire on Tuesday the 15th. However if you specify “1W” as the value for
day-of-month, and the 1st is a Saturday, the trigger will fire on Monday the 3rd, as it will not
‘jump’ over the boundary of a month’s days. The ‘W’ character can only be specified when the
day-of-month is a single day, not a range or list of days.

The 'L' and 'W' characters can also be combined in the day-of-month field to yield 'LW', which
translates to *"last weekday of the month"*.

# - used to specify “the nth” XXX day of the month. For example, the value of “6#3” in the
day-of-week field means “the third Friday of the month” (day 6 = Friday and “#3” = the 3rd one in
the month). Other examples: “2#1” = the first Monday of the month and “4#5” = the fifth Wednesday
of the month. Note that if you specify “#5” and there is not 5 of the given day-of-week in the
month, then no firing will occur that month.

*/
