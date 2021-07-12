import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { formatDate } from '@angular/common';

import { GenericDataSource } from './generic-datasource';
import { Alarm } from './alarm.model';
import { AlarmService } from '../services';
import { BehaviorSubject } from 'rxjs';

export class AlarmDataSource extends GenericDataSource<Alarm> {
    private alarms: Alarm[] = [];
    private alarmsSubject = new BehaviorSubject<Alarm[]>(this.alarms);
    private summary = true;

    constructor(private alarmService: AlarmService, paginator: MatPaginator, sort: MatSort) {
        super(paginator, sort);
        this.alarmService.getAll().subscribe((data) => {
            this.alarms = data;
            this.loadSummary();
        });
    }

    dataSource() {
        return this.alarmsSubject;
    }

    loadSummary() {
        this.summary = true;
        this.reload();
    }

    loadHistory() {
        this.summary = false;
        this.reload();
    }

    add(item: Alarm) {
        this.alarms.push(item);
        this.reload();
    }

    update(id: string, item: Alarm) {
        this.alarms = this.alarms.map((a) => (a._id === id ? item : a));
        this.reload();
    }

    delete(id: string) {
        this.alarms = this.alarms.filter((a) => a._id !== id);
        this.reload();
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

    private reload() {
        if (this.summary) {
            // client-side map reduce: opting for client-side map reduce to prevent server loading
            const result = {};
            for (const alarm of this.alarms) {
                const topic = alarm.topic;
                if (!result[topic]) {
                    result[topic] = [];
                }
                result[topic].push({
                    severity: alarm.severity,
                    name: alarm.name,
                    topic: alarm.topic,
                    value: alarm.value,
                    state: alarm.state,
                    ackreq: alarm.ackreq,
                    timestamp: alarm.timestamp,
                    acktime: alarm.acktime || 0,
                    unackActive: alarm.state && !alarm.acktime ? 1 : 0,
                });
            }

            const reduceFunc = (prev, curr) => {
                const latest = curr.timestamp >= prev.timestamp ? curr : prev;
                latest.unackActive = prev.unackActive + curr.unackActive;
                return latest;
            };

            for (const topic in result) {
                if (result.hasOwnProperty(topic)) {
                    const reduced = result[topic].reduce(reduceFunc);
                    // only include alarms that are active or unack'd alarms
                    if (reduced.state || reduced.unackActive) {
                        if (reduced.acktime === 0) {
                            // remove acktime field if no timestamp set
                            delete reduced.acktime;
                        }
                        result[topic] = reduced;
                    } else {
                        delete result[topic];
                    }
                }
            }
            const summaryData: Alarm[] = Object.values(result);
            this.alarmsSubject.next(summaryData);
        } else {
            // history mode
            this.alarmsSubject.next(this.alarms);
        }
    }
}
