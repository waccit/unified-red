import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';
import { HolidayValidator } from './schedule.validators';

export const UR_SCHEDULE_DATE_FORMATS = {
    parse: {
        dateInput: 'MM/DD',
    },
    display: {
        dateInput: 'MM/DD',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@Component({
    selector: 'app-ur-schedule-form-dialog',
    templateUrl: './ur-schedule-form-dialog.component.html',
    styleUrls: ['./ur-schedule-form-dialog.component.sass'],
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },
        { provide: MAT_DATE_FORMATS, useValue: UR_SCHEDULE_DATE_FORMATS },
    ],
})
export class UrScheduleFormDialogComponent {
    title: string;
    form: FormGroup;
    data: any; // { start, end, values, type }
    oldHoliday = '';

    // select field options
    hours = [...Array(24).keys()];
    minutes = [...Array(60).keys()].map((i) => i.toString().padStart(2, '0'));
    dates = [...Array(31).keys()].map((i) => (i + 1).toString());
    weekdays = [
        { value: '0', text: 'Sunday', short: 'Su' },
        { value: '1', text: 'Monday', short: 'M' },
        { value: '2', text: 'Tuesday', short: 'Tu' },
        { value: '3', text: 'Wednesday', short: 'W' },
        { value: '4', text: 'Thursday', short: 'Th' },
        { value: '5', text: 'Friday', short: 'F' },
        { value: '6', text: 'Saturday', short: 'Sa' },
    ];
    nth = [
        { value: '1', text: '1st' },
        { value: '2', text: '2nd' },
        { value: '3', text: '3rd' },
        { value: '4', text: '4th' },
        { value: '5', text: '5th' },
        // { value: 'L', text: 'Last' },
    ];
    months = [
        { value: '1', text: 'Jan' },
        { value: '2', text: 'Feb' },
        { value: '3', text: 'Mar' },
        { value: '4', text: 'Apr' },
        { value: '5', text: 'May' },
        { value: '6', text: 'Jun' },
        { value: '7', text: 'Jul' },
        { value: '8', text: 'Aug' },
        { value: '9', text: 'Sep' },
        { value: '10', text: 'Oct' },
        { value: '11', text: 'Nov' },
        { value: '12', text: 'Dec' },
    ];

    mode = new FormControl('side');
    eventForm: FormGroup;
    isNewEvent = false;
    dialogTitle: string;
    action: string;
    events = [];

    constructor(
        public dialogRef: MatDialogRef<UrScheduleFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData: any,
        private formBuilder: FormBuilder
    ) {
        this.action = dialogData.action;
        this.data = dialogData.data;
        this.title = this.action === 'add' ? 'New Schedule' : 'Edit Schedule';
        if (this.data.events?.length) {
            const r = {
                repeat: null,
                weekly: { weekday: null },
                month: { type: null, date: null, weekdayOccurrence: null, weekday: null },
                year: { type: null, month: null, date: null, weekdayOccurrence: null, weekday: null },
            };
            this.oldHoliday = this.data.events[0]._pattern || '';
            if (this.oldHoliday) {
                const [ sec, min, hour, date, month, weekday ] = this.oldHoliday.split(' ');
                if (this.isWeeklyPattern(this.oldHoliday)) {
                    r.repeat = 'weekly';
                    r.weekly.weekday = weekday.split(',');
                } else if (this.isMonthlyDatePattern(this.oldHoliday)) {
                    r.repeat = 'monthly';
                    r.month.type = 'date';
                    r.month.date = date.split(',');
                } else if (this.isMonthlyWeekdayPattern(this.oldHoliday)) {
                    r.repeat = 'monthly';
                    r.month.type = 'weekday';
                    const w = weekday.split('#');
                    if (w.length === 2) {
                        r.month.weekday = w[0];
                        r.month.weekdayOccurrence = w[1];
                    }
                } else if (this.isYearlyDatePattern(this.oldHoliday)) {
                    r.repeat = 'yearly';
                    r.year.type = 'date';
                    r.year.date = date.split(',');
                    r.year.month = month.split(',');
                } else if (this.isYearlyWeekdayPattern(this.oldHoliday)) {
                    r.repeat = 'yearly';
                    r.year.type = 'weekday';
                    r.year.month = month.split(',');
                    const w = weekday.split('#');
                    if (w.length === 2) {
                        r.year.weekday = w[0];
                        r.year.weekdayOccurrence = w[1];
                    }
                }
            }

            this.form = this.formBuilder.group({
                type: [this.data.type, Validators.required],
                weekday: [this.data.events[0].weekday],
                date: [
                    this.data.events[0].date
                        ? moment(Date.parse(this.data.events[0].date)).year(moment().year())
                        : null,
                ],
                repeat: [r.repeat],
                repeatWeekdays: [r.weekly.weekday],
                repeatMonthType: [r.month.type],
                repeatMonthDate: [r.month.date],
                repeatMonthWeekdayOccurrence: [r.month.weekdayOccurrence],
                repeatMonthWeekday: [r.month.weekday],
                repeatYearMonth: [r.year.month],
                repeatYearType: [r.year.type],
                repeatYearDate: [r.year.date],
                repeatYearWeekdayOccurrence: [r.year.weekdayOccurrence],
                repeatYearWeekday: [r.year.weekday],
            },
            {
                validator: HolidayValidator(),
            });
            this.events = this.sortChronologically(this.data.events).map((e, i) => {
                e.id = i;
                e.minute = e.minute.toString().padStart(2, '0');
                return e;
            });
        }
        this.eventForm = this.createEventFormGroup(null);
    }

    submit(addTo = null) {
        return {
            action: this.action,
            ...this.form.getRawValue(),
            holiday: this.generateHolidayPattern(),
            events: this.events,
            addTo,
        };
    }

    delete() {
        return {
            action: 'delete',
            ...this.form.getRawValue(),
            events: this.events,
        };
    }

    public confirm(): void {}

    generateHolidayPattern() {
        const fc = this.form.controls;
        if (fc.type.value !== 'holiday') {
            return null;
        }
        let date;
        let month;
        let weekday;
        if (fc.repeat.value === 'weekly') {
            date = month = '*';
            weekday = fc.repeatWeekdays.value;
        } else if (fc.repeat.value === 'monthly') {
            month = '*';
            if (fc.repeatMonthType.value === 'date') {
                date = fc.repeatMonthDate.value;
                weekday = '*';
            } else if (fc.repeatMonthType.value === 'weekday') {
                date = '*';
                weekday = fc.repeatMonthWeekday.value + '#' + fc.repeatMonthWeekdayOccurrence.value;
            }
        } else if (fc.repeat.value === 'yearly') {
            month = fc.repeatYearMonth.value;
            if (fc.repeatYearType.value === 'date') {
                date = fc.repeatYearDate.value;
                weekday = '*';
            } else if (fc.repeatYearType.value === 'weekday') {
                date = '*';
                weekday = fc.repeatYearWeekday.value + '#' + fc.repeatYearWeekdayOccurrence.value;
            }
        }
        const smh = this.oldHoliday ? this.oldHoliday.split(' ').slice(0, 3) : ['0', '0', '0'];
        const newPattern = [...smh, date, month, weekday].join(' ');
        return newPattern;
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.events, event.previousIndex, event.currentIndex);
    }

    addNewEvent(nav: any) {
        this.resetEventFormField();
        this.isNewEvent = true;
        this.dialogTitle = 'Add';
        nav.open();
    }

    eventClick(event, nav: any): void {
        this.isNewEvent = false;
        this.dialogTitle = 'Edit';
        nav.open();
        this.eventForm = this.createEventFormGroup(event);
    }

    closeSlider(nav: any) {
        if (nav.open()) {
            nav.close();
        }
    }

    createEventFormGroup(data: any) {
        return this.formBuilder.group({
            id: [data ? data.id : this.getRandomID()],
            value: [data ? data.value : ''],
            hour: [data ? data.hour : '0'],
            minute: [data ? data.minute.toString().padStart(2, '0') : '00'],
        });
    }

    saveEvent(nav: any) {
        this.events.push(this.eventForm.value);
        this.resetEventFormField();
        nav.close();
    }

    editEvent(nav: any) {
        const i = this.events.map((item) => item.id).indexOf(this.eventForm.value.id);
        this.events[i] = this.eventForm.value;
        nav.close();
    }

    deleteEvent(nav: any) {
        const i = this.events.map((item) => item.id).indexOf(this.eventForm.value.id);
        this.events.splice(i, 1);
        nav.close();
    }

    resetEventFormField() {
        this.eventForm.controls.value.reset();
        this.eventForm.controls.hour.reset();
        this.eventForm.controls.minute.reset();
    }

    public getRandomID(): string {
        const S4 = () => {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return S4() + S4();
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

    private isWeeklyPattern(pattern) {
        /* Weekly expression e.g. 0 0 0 * * 0 */
        return /([\*\d-,]+\s+){3}(\*\s+){2}([\d-,]+)$/.test(pattern);
    }

    private isMonthlyDatePattern(pattern) {
        /* Monthly date expression e.g. 0 0 0 15 * */
        return /([\*\d-,]+\s+){3}([\d-,]+|L)(\s+\*){2}$/.test(pattern);
    }

    private isMonthlyWeekdayPattern(pattern) {
        /* Monthly weekday expression e.g. 0 0 0 * * 0#1 */
        return /([\*\d-,]+\s+){3}(\*\s+){2}[\d-,]+(#\d|L)$/.test(pattern);
    }

    private isYearlyDatePattern(pattern) {
        /* Yearly date expression e.g. 0 0 0 25 12 * */
        return /([\*\d-,]+\s+){3}([\d-,]+|L)\s+[\d-,]+\s+\*$/.test(pattern);
    }

    private isYearlyWeekdayPattern(pattern) {
        /* Yearly weekday expression e.g. 0 0 0 * 11 4#4 */
        return /([\*\d-,]+\s+){3}\*\s+[\d-,]+\s+[\d-,]+(#\d|L)$/.test(pattern);
    }

    onTypeChange() {
        for (const key in this.form.controls) {
            this.form.get(key).clearValidators();
            this.form.get(key).updateValueAndValidity({onlySelf: true});
        }
    }
}
