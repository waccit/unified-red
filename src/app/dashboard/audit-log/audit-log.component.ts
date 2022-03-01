import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuditEntry } from '../../data/audit-entry.model';
import AuditService from '../../services/audit.service';

const MONTHS = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec',
};

@Component({
    selector: 'app-audit-log',
    templateUrl: './audit-log.component.html',
    styleUrls: ['./audit-log.component.sass'],
})
export class AuditLogComponent implements OnInit {
    displayedColumns: string[] = ['timestamp', 'username', 'page', 'point', 'value'];
    dataSource = new MatTableDataSource<AuditEntry>([]);
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    logs: String[] = [];
    log: String;

    constructor(private auditService: AuditService) { }

    ngOnInit(): void {
        this.auditService.getLogsList().subscribe((list: String[]) => {
            this.logs = [...list];
            this.loadLog();
        });

        this.dataSource.sortingDataAccessor = (entry, property) => {
            switch (property) {
                case 'timestamp':
                    return new Date(entry.timestamp);
                default:
                    return entry[property];
            }
        };
        this.dataSource.sort = this.sort;
        // this.sort.disableClear = true; // this will disable "unsort"
        this.dataSource.paginator = this.paginator;
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    prettyLogName(log: String) {
        let nameArr = log.split('.');
        return MONTHS[nameArr[1]] + ' ' + nameArr[0]; // format as 'MON YEAR'
    }

    loadLog(opt?) {
        this.log = opt ? opt.value : this.logs[0]; // on init show first log (latest log)

        if (this.log) {
            this.auditService.getLog(this.log).subscribe((l) => {
                this.dataSource.data = l ? l : [];
            });
        }
    }
}
