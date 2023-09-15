
import { DataLog } from './datalog.model';
import { DataLogService } from '../services';
import { DataLogQuery } from './datalog-query.model';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { UtilService } from '../services/util.service';

export class DataLogDataSource extends DataSource<DataLog> {
    private data = [];
    private dataSubject = new BehaviorSubject<any[]>(this.data);

    constructor(private dataLogService: DataLogService, queryParams: DataLogQuery, private labels) {
        super();
        this.labels = labels;
        this.dataLogService.query(queryParams).subscribe((data: any) => {
          console.log("DATALOG", data)
            this.data = data.map((entry) => {
              console.log(entry)
              // console.log(new Date(entry.timestamp.replaceAll('-', '/')))
              console.log(entry.timestamp)
              console.log(new Date(entry.timestamp))
                entry.timestamp = new Date(entry.timestamp);
                entry.name = labels[entry.topic] || entry.topic;
                return entry;
            });
            this.data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // descending
            this.dataSubject.next(this.data);
        });
    }

    connect(): Observable<any[]> {
        return this.dataSubject;
    }

    disconnect() {
        this.dataSubject.complete();
    }

    add(item) {
        this.data.unshift({
            timestamp: new Date(item.timestamp),
            value: item.value,
            name: this.labels[item.topic] || item.topic
        });
        this.dataSubject.next(this.data);
    }
}
