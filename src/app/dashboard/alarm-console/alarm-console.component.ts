import { Component, ElementRef, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fromEvent, Subscription } from 'rxjs';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { WebSocketService, SnackbarService, AlarmService, AuthenticationService } from '../../services';
import { AlarmDataSource, Role } from '../../data';
import { MatDialog } from '@angular/material/dialog';
import { AlarmDialogComponent } from './alarm-dialog.component';

@Component({
	selector: 'app-alarm-console',
	templateUrl: './alarm-console.component.html',
	styleUrls: ['./alarm-console.component.sass'],
	providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-US' }],
})
export class AlarmConsoleComponent implements OnInit, OnDestroy {
    displayedColumns = ['severity', 'name', 'topic', 'value', 'state', 'acktime', 'timestamp', 'actions'];
	dataSource: AlarmDataSource;
	private _wsSubscription: Subscription;
	isAdmin = false;
	
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: true }) filter: ElementRef;

	constructor(
		private webSocketService: WebSocketService,
		private alarmService: AlarmService,
		private snackbar: SnackbarService,
		private authenticationService: AuthenticationService,
		public dialog: MatDialog,
	) {}

	ngOnInit(): void {
        this._wsSubscription = this.webSocketService.listen('ur-alarm-update').subscribe((msg:any) => {
			if (msg && msg.payload) {
				if (msg.action === "create") {
					this.dataSource.add(msg.payload);
				}
				else if (msg.action === "update") {
					this.dataSource.update(msg.payload.id, msg.payload);
				}
				else if (msg.action === "delete") {
					this.dataSource.delete(msg.payload.id);
				}
			}
		});
		this.refreshData();
		this.isAdmin = this.authenticationService.getUserRole() === Role.Level10;
	}

	ngOnDestroy(): void {
        if (this._wsSubscription) {
            this._wsSubscription.unsubscribe();
        }
    }

    refreshData() {
        this.dataSource = new AlarmDataSource(this.alarmService, this.paginator, this.sort);
        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(debounceTime(150), distinctUntilChanged())
            .subscribe(() => {
                this.dataSource.filter = this.filter.nativeElement.value;
            });
    }
	
	send(msg: any) {
		this.webSocketService.emit({ id: "nodeId", msg: msg });
    }

	ackAlarm(row) {
		this.alarmService.ackByTopic(row.topic).subscribe(alarms => {
			this.snackbar.success(row.name + ' acknowleged');
		});
	}

	deleteAlarm(row) {
		this.alarmService.delete(row.id).subscribe(data => {
			this.snackbar.success(row.name + ' deleted');
		});
	}

	openAlarmDialog(row) {
        this.dialog.open(AlarmDialogComponent, { data: row });
    }
}
