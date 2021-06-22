import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuditEntry } from '../../data/audit-entry.model';
import AuditService from '../../services/audit.service';

const SAMPLE_DATA: AuditEntry[] = [
    {
        timestamp: '6/21/2021, 4:39:59 PM',
        username: 'abc',
        page: 'VAV 7-01',
        point: 'eSetpoints99.occupied_heat',
        value: '-3',
    },
    {
        timestamp: '6/21/2021, 5:39:59 PM',
        username: 'abd',
        page: 'VAV 7-02',
        point: 'eSetpoints99.occupied_heat',
        value: '23',
    },
    {
        timestamp: '6/21/2021, 6:39:59 PM',
        username: 'abe',
        page: 'VAV 7-03',
        point: 'eSetpoints99.occupied_heat',
        value: '2',
    },
    {
        timestamp: '6/24/2021, 4:39:59 PM',
        username: 'abf',
        page: 'VAV 7-04',
        point: 'eSetpoints99.occupied_heat',
        value: '8',
    },
    {
        timestamp: '6/25/2021, 4:39:59 PM',
        username: 'abg',
        page: 'VAV 7-05',
        point: 'eSetpoints99.occupied_heat',
        value: '-7',
    },
    {
        timestamp: '6/26/2021, 4:39:59 PM',
        username: 'abh',
        page: 'VAV 7-06',
        point: 'eSetpoints99.occupied_heat',
        value: '11',
    },
    {
        timestamp: '6/27/2021, 4:39:59 PM',
        username: 'abi',
        page: 'VAV 7-07',
        point: 'eSetpoints99.occupied_heat',
        value: '46',
    },
    {
        timestamp: '6/28/2021, 4:39:59 PM',
        username: 'abj',
        page: 'VAV 7-08',
        point: 'eSetpoints99.occupied_heat',
        value: '-29',
    },
    {
        timestamp: '6/29/2021, 4:39:59 PM',
        username: 'abk',
        page: 'VAV 7-09',
        point: 'eSetpoints99.occupied_heat',
        value: '9',
    },
    {
        timestamp: '6/30/2021, 4:39:59 PM',
        username: 'abl',
        page: 'VAV 7-10',
        point: 'eSetpoints99.occupied_heat',
        value: '-5',
    },
    {
        timestamp: '6/21/2021, 4:39:59 PM',
        username: 'abc',
        page: 'VAV 7-01',
        point: 'eSetpoints99.occupied_heat',
        value: '-3',
    },
    {
        timestamp: '6/21/2021, 5:39:59 PM',
        username: 'abd',
        page: 'VAV 7-02',
        point: 'eSetpoints99.occupied_heat',
        value: '23',
    },
    {
        timestamp: '6/21/2021, 6:39:59 PM',
        username: 'abe',
        page: 'VAV 7-03',
        point: 'eSetpoints99.occupied_heat',
        value: '2',
    },
    {
        timestamp: '6/24/2021, 4:39:59 PM',
        username: 'abf',
        page: 'VAV 7-04',
        point: 'eSetpoints99.occupied_heat',
        value: '8',
    },
    {
        timestamp: '6/25/2021, 4:39:59 PM',
        username: 'abg',
        page: 'VAV 7-05',
        point: 'eSetpoints99.occupied_heat',
        value: '-7',
    },
    {
        timestamp: '6/26/2021, 4:39:59 PM',
        username: 'abh',
        page: 'VAV 7-06',
        point: 'eSetpoints99.occupied_heat',
        value: '11',
    },
    {
        timestamp: '6/27/2021, 4:39:59 PM',
        username: 'abi',
        page: 'VAV 7-07',
        point: 'eSetpoints99.occupied_heat',
        value: '46',
    },
    {
        timestamp: '6/28/2021, 4:39:59 PM',
        username: 'abj',
        page: 'VAV 7-08',
        point: 'eSetpoints99.occupied_heat',
        value: '-29',
    },
    {
        timestamp: '6/29/2021, 4:39:59 PM',
        username: 'abk',
        page: 'VAV 7-09',
        point: 'eSetpoints99.occupied_heat',
        value: '9',
    },
    {
        timestamp: '6/30/2021, 4:39:59 PM',
        username: 'abl',
        page: 'VAV 7-10',
        point: 'eSetpoints99.occupied_heat',
        value: '-5',
    },
    {
        timestamp: '6/21/2021, 4:39:59 PM',
        username: 'abc',
        page: 'VAV 7-01',
        point: 'eSetpoints99.occupied_heat',
        value: '-3',
    },
    {
        timestamp: '6/21/2021, 5:39:59 PM',
        username: 'abd',
        page: 'VAV 7-02',
        point: 'eSetpoints99.occupied_heat',
        value: '23',
    },
    {
        timestamp: '6/21/2021, 6:39:59 PM',
        username: 'abe',
        page: 'VAV 7-03',
        point: 'eSetpoints99.occupied_heat',
        value: '2',
    },
    {
        timestamp: '6/24/2021, 4:39:59 PM',
        username: 'abf',
        page: 'VAV 7-04',
        point: 'eSetpoints99.occupied_heat',
        value: '8',
    },
    {
        timestamp: '6/25/2021, 4:39:59 PM',
        username: 'abg',
        page: 'VAV 7-05',
        point: 'eSetpoints99.occupied_heat',
        value: '-7',
    },
    {
        timestamp: '6/26/2021, 4:39:59 PM',
        username: 'abh',
        page: 'VAV 7-06',
        point: 'eSetpoints99.occupied_heat',
        value: '11',
    },
    {
        timestamp: '6/27/2021, 4:39:59 PM',
        username: 'abi',
        page: 'VAV 7-07',
        point: 'eSetpoints99.occupied_heat',
        value: '46',
    },
    {
        timestamp: '6/28/2021, 4:39:59 PM',
        username: 'abj',
        page: 'VAV 7-08',
        point: 'eSetpoints99.occupied_heat',
        value: '-29',
    },
    {
        timestamp: '6/29/2021, 4:39:59 PM',
        username: 'abk',
        page: 'VAV 7-09',
        point: 'eSetpoints99.occupied_heat',
        value: '9',
    },
    {
        timestamp: '6/30/2021, 4:39:59 PM',
        username: 'abl',
        page: 'VAV 7-10',
        point: 'eSetpoints99.occupied_heat',
        value: '-5',
    },
    {
        timestamp: '6/21/2021, 4:39:59 PM',
        username: 'abc',
        page: 'VAV 7-01',
        point: 'eSetpoints99.occupied_heat',
        value: '-3',
    },
    {
        timestamp: '6/21/2021, 5:39:59 PM',
        username: 'abd',
        page: 'VAV 7-02',
        point: 'eSetpoints99.occupied_heat',
        value: '23',
    },
    {
        timestamp: '6/21/2021, 6:39:59 PM',
        username: 'abe',
        page: 'VAV 7-03',
        point: 'eSetpoints99.occupied_heat',
        value: '2',
    },
    {
        timestamp: '6/24/2021, 4:39:59 PM',
        username: 'abf',
        page: 'VAV 7-04',
        point: 'eSetpoints99.occupied_heat',
        value: '8',
    },
    {
        timestamp: '6/25/2021, 4:39:59 PM',
        username: 'abg',
        page: 'VAV 7-05',
        point: 'eSetpoints99.occupied_heat',
        value: '-7',
    },
    {
        timestamp: '6/26/2021, 4:39:59 PM',
        username: 'abh',
        page: 'VAV 7-06',
        point: 'eSetpoints99.occupied_heat',
        value: '11',
    },
    {
        timestamp: '6/27/2021, 4:39:59 PM',
        username: 'abi',
        page: 'VAV 7-07',
        point: 'eSetpoints99.occupied_heat',
        value: '46',
    },
    {
        timestamp: '6/28/2021, 4:39:59 PM',
        username: 'abj',
        page: 'VAV 7-08',
        point: 'eSetpoints99.occupied_heat',
        value: '-29',
    },
    {
        timestamp: '6/29/2021, 4:39:59 PM',
        username: 'abk',
        page: 'VAV 7-09',
        point: 'eSetpoints99.occupied_heat',
        value: '9',
    },
    {
        timestamp: '6/30/2021, 4:39:59 PM',
        username: 'abl',
        page: 'VAV 7-10',
        point: 'eSetpoints99.occupied_heat',
        value: '-5',
    },
    {
        timestamp: '6/21/2021, 4:39:59 PM',
        username: 'abc',
        page: 'VAV 7-01',
        point: 'eSetpoints99.occupied_heat',
        value: '-3',
    },
    {
        timestamp: '6/21/2021, 5:39:59 PM',
        username: 'abd',
        page: 'VAV 7-02',
        point: 'eSetpoints99.occupied_heat',
        value: '23',
    },
    {
        timestamp: '6/21/2021, 6:39:59 PM',
        username: 'abe',
        page: 'VAV 7-03',
        point: 'eSetpoints99.occupied_heat',
        value: '2',
    },
    {
        timestamp: '6/24/2021, 4:39:59 PM',
        username: 'abf',
        page: 'VAV 7-04',
        point: 'eSetpoints99.occupied_heat',
        value: '8',
    },
    {
        timestamp: '6/25/2021, 4:39:59 PM',
        username: 'abg',
        page: 'VAV 7-05',
        point: 'eSetpoints99.occupied_heat',
        value: '-7',
    },
    {
        timestamp: '6/26/2021, 4:39:59 PM',
        username: 'abh',
        page: 'VAV 7-06',
        point: 'eSetpoints99.occupied_heat',
        value: '11',
    },
    {
        timestamp: '6/27/2021, 4:39:59 PM',
        username: 'abi',
        page: 'VAV 7-07',
        point: 'eSetpoints99.occupied_heat',
        value: '46',
    },
    {
        timestamp: '6/28/2021, 4:39:59 PM',
        username: 'abj',
        page: 'VAV 7-08',
        point: 'eSetpoints99.occupied_heat',
        value: '-29',
    },
    {
        timestamp: '6/29/2021, 4:39:59 PM',
        username: 'abk',
        page: 'VAV 7-09',
        point: 'eSetpoints99.occupied_heat',
        value: '9',
    },
    {
        timestamp: '6/30/2021, 4:39:59 PM',
        username: 'abl',
        page: 'VAV 7-10',
        point: 'eSetpoints99.occupied_heat',
        value: '-5',
    },
    {
        timestamp: '6/21/2021, 4:39:59 PM',
        username: 'abc',
        page: 'VAV 7-01',
        point: 'eSetpoints99.occupied_heat',
        value: '-3',
    },
    {
        timestamp: '6/21/2021, 5:39:59 PM',
        username: 'abd',
        page: 'VAV 7-02',
        point: 'eSetpoints99.occupied_heat',
        value: '23',
    },
    {
        timestamp: '6/21/2021, 6:39:59 PM',
        username: 'abe',
        page: 'VAV 7-03',
        point: 'eSetpoints99.occupied_heat',
        value: '2',
    },
    {
        timestamp: '6/24/2021, 4:39:59 PM',
        username: 'abf',
        page: 'VAV 7-04',
        point: 'eSetpoints99.occupied_heat',
        value: '8',
    },
    {
        timestamp: '6/25/2021, 4:39:59 PM',
        username: 'abg',
        page: 'VAV 7-05',
        point: 'eSetpoints99.occupied_heat',
        value: '-7',
    },
    {
        timestamp: '6/26/2021, 4:39:59 PM',
        username: 'abh',
        page: 'VAV 7-06',
        point: 'eSetpoints99.occupied_heat',
        value: '11',
    },
    {
        timestamp: '6/27/2021, 4:39:59 PM',
        username: 'abi',
        page: 'VAV 7-07',
        point: 'eSetpoints99.occupied_heat',
        value: '46',
    },
    {
        timestamp: '6/28/2021, 4:39:59 PM',
        username: 'abj',
        page: 'VAV 7-08',
        point: 'eSetpoints99.occupied_heat',
        value: '-29',
    },
    {
        timestamp: '6/29/2021, 4:39:59 PM',
        username: 'abk',
        page: 'VAV 7-09',
        point: 'eSetpoints99.occupied_heat',
        value: '9',
    },
    {
        timestamp: '6/30/2021, 4:39:59 PM',
        username: 'abl',
        page: 'VAV 7-10',
        point: 'eSetpoints99.occupied_heat',
        value: '-5',
    },
];

@Component({
    selector: 'app-audit-log',
    templateUrl: './audit-log.component.html',
    styleUrls: ['./audit-log.component.sass'],
})
export class AuditLogComponent implements OnInit {
    displayedColumns: string[] = ['timestamp', 'username', 'page', 'point', 'value'];
    dataSource: MatTableDataSource<AuditEntry>;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    constructor(private auditService: AuditService) {
        this.dataSource = new MatTableDataSource();
    }

    ngOnInit(): void {
        this.auditService.getAll().subscribe((log) => {
            this.dataSource = new MatTableDataSource<AuditEntry>(log);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
        });
    }
}
