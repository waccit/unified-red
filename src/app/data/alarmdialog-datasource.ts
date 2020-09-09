import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { Alarm } from './alarm.model';
import { AlarmService } from '../services';
import { GenericDataSource } from './generic-datasource';

export class AlarmDialogDataSource extends GenericDataSource<Alarm> {
    constructor(private topic: string, private alarmService: AlarmService, paginator: MatPaginator, sort: MatSort) {
        super(paginator, sort);
    }
    
    dataSource() {
        return this.alarmService.getByTopic(this.topic);
    }

    searchColumns(item: Alarm) {
        return [];
    }
}