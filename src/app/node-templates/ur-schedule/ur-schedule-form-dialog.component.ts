import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';

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

    hours = [...Array(24).keys()];
    minutes = [...Array(60).keys()].map((i) => i.toString().padStart(2, '0'));

    mode = new FormControl('side');
    eventForm: FormGroup;
    isNewEvent = false;
    dialogTitle: string;
    events = [];

    constructor(
        public dialogRef: MatDialogRef<UrScheduleFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData: any,
        private formBuilder: FormBuilder
    ) {
        console.log(dialogData);
        this.title = dialogData.action === 'add' ? 'Edit Schedule' : 'New Schedule';
        this.data = dialogData.data;
        this.form = this.formBuilder.group({
            type: [this.data.type, Validators.required],
            weekday: [this.data.start.weekday],
            date: [this.data.start.date ? moment(Date.parse(this.data.start.date)).year(moment().year()) : null],
            holiday: [this.data.start._pattern],
        });
        if (this.data.start) {
            this.events.push({
                id: this.events.length,
                value: this.data.start.value,
                hour: this.data.start.hour,
                minute: this.data.start.minute?.toString().padStart(2, '0'),
            });
        }
        if (this.data.end) {
            this.events.push({
                id: this.events.length,
                value: this.data.end.value,
                hour: this.data.end.hour,
                minute: this.data.end.minute?.toString().padStart(2, '0'),
            });
        }
        this.eventForm = this.createEventFormGroup(null);
    }

    submit() {}

    public confirm(): void {}

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

    saveEvent() {
        this.events.unshift(this.eventForm.value);
        this.resetEventFormField();
    }

    editEvent() {
        const targetIdx = this.events.map((item) => item.id).indexOf(this.eventForm.value.id);
        this.events[targetIdx] = this.eventForm.value;
    }

    deleteEvent(nav: any) {
        const targetIdx = this.events.map((item) => item.id).indexOf(this.eventForm.value.id);
        this.events.splice(targetIdx, 1);
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
}
