import { Component, ViewChild } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';

var d = new Date(),
    date = d.getDate(),
    month = d.getMonth(),
    year = d.getFullYear();

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {
    @ViewChild('calendar', { static: false })
    calendarComponent: FullCalendarComponent; // the #calendar in the template

    calendarVisible = true;
    calendarPlugins = [dayGridPlugin];
    calendarWeekends = true;
    calendarEvents: EventInput[] = [
        {
            title: 'Conference',
            start: new Date(year, month, date - 5, 0, 0),
            end: new Date(year, month, date - 2, 0, 0),
            backgroundColor: '#00FFFF',
        },
        {
            title: 'Holiday',
            start: new Date(year, month, date - 10, 9, 0),
            end: new Date(year, month, date - 8, 0, 0),
            backgroundColor: '#F3565D',
        },
        {
            title: 'Repeating Event',
            start: new Date(year, month, date + 5, 16, 0),
            allDay: !1,
            backgroundColor: '#1bbc9b',
        },
        {
            title: 'Meeting',
            start: new Date(year, month, date, 10, 30),
            allDay: !1,
        },
        {
            title: 'Result Day',
            start: new Date(year, month, date + 7, 19, 0),
            end: new Date(year, month, date + 1, 22, 30),
            backgroundColor: '#DC35A9',
            allDay: !1,
        },
        {
            title: 'Click for Google',
            start: new Date(year, month, 29),
            end: new Date(year, month, 30),
            backgroundColor: '#9b59b6',
            url: 'http://google.com/',
        },
    ];
}
