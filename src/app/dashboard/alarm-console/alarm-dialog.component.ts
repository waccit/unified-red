import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AlarmService, SnackbarService, WebSocketService } from '../../services';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AlarmDialogDataSource } from '../../data';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-alarm-dialog',
    templateUrl: './alarm-dialog.component.html',
    styleUrls: ['./alarm-dialog.component.sass'],
    providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-US' }],
})
export class AlarmDialogComponent implements OnInit, OnDestroy {
    displayedColumns = ['severity', 'timestamp', 'value', 'state', 'acktime'];
    dataSource: AlarmDialogDataSource;
    data: any;
    private _wsSubscription: Subscription;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(
        public dialogRef: MatDialogRef<AlarmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData: any,
        private webSocketService: WebSocketService,
        private alarmService: AlarmService,
        private snackbar: SnackbarService,
    ) {
        this.data = this.dialogData;
    }

    ngOnInit(): void {
        this._wsSubscription = this.webSocketService.listen('ur-alarm-update').subscribe((msg:any) => {
			if (msg && msg.payload && msg.payload.topic === this.data.topic) {
                this.dataSource = new AlarmDialogDataSource(this.data.topic, this.alarmService, this.paginator, this.sort);
			}
		});
        this.dataSource = new AlarmDialogDataSource(this.data.topic, this.alarmService, this.paginator, this.sort);
    }

    ngOnDestroy(): void {
        if (this._wsSubscription) {
            this._wsSubscription.unsubscribe();
        }
    }

    ackAlarm() {
		this.alarmService.ackByTopic(this.data.topic).subscribe(alarms => {
            this.snackbar.success(this.data.name + ' acknowleged');
            this.dialogRef.close();
		});
	}
}
