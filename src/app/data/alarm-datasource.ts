import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { formatDate } from '@angular/common';

import { GenericDataSource } from './generic-datasource';
import { Alarm } from './alarm.model';
import { AlarmService } from '../services';
import { BehaviorSubject } from 'rxjs';

export class AlarmDataSource extends GenericDataSource<Alarm> {
    private alarms : Alarm[] = [];
    private alarmsSubject = new BehaviorSubject<Alarm[]>(this.alarms);

    constructor(private alarmService: AlarmService, paginator: MatPaginator, sort: MatSort) {
        super(paginator, sort);
        this.loadSummary();
    }

    dataSource() {
        return this.alarmsSubject;
    }

    loadSummary() {
        this.alarmService.getSummary().subscribe((data:any) => {
            this.alarms = data.results.map(v => v.value);
            this.alarmsSubject.next(this.alarms);
        });
    }

    loadHistory() {
        this.alarmService.getAll().subscribe(data => {
            this.alarms = data;
            this.alarmsSubject.next(this.alarms);
        });
    }

    add(item: Alarm) {
        this.alarms.push(item);
        this.alarmsSubject.next(this.alarms);
    }

    update(id: string, item: Alarm) {
        this.alarms = this.alarms.map(a => a.id === id ? item : a );
        this.alarmsSubject.next(this.alarms);
    }

    delete(id: string) {
        this.alarms = this.alarms.filter(a => a.id !== id);
        this.alarmsSubject.next(this.alarms);
    }

    searchColumns(item: Alarm) {
        return [
            'severity:' + item.severity,
            'name:' + item.name,
            'topic:' + item.topic,
            'value:' + item.value,
            'state:' + item.state,
            'ackreq:' + item.ackreq,
            'ack:' + (item.acktime ? formatDate(item.acktime, 'MM/dd/yyyy HH:mm:ss', 'en') : 'no'),
            'timestamp:' + (item.timestamp ? formatDate(item.timestamp, 'MM/dd/yyyy HH:mm:ss', 'en') : 'no'),
        ];
    }
}