import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserFormDialogComponent } from './user-form-dialog.component';
import { UserDeleteDialogComponent } from './user-delete-dialog.component';
import { SnackbarService, UserService } from '../../services';
import { User, UserDataSource } from '../../data/';

@Component({
    selector: 'app-user-table',
    templateUrl: './user-table.component.html',
    styleUrls: ['./user-table.component.sass'],
    providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-US' }],
})
export class UserTableComponent implements OnInit {
    displayedColumns = ['enabled', 'username', 'firstName', 'lastName', 'email', 'expirationDate', 'actions'];
    dataSource: UserDataSource;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild('filter', { static: true }) filter: ElementRef;

    constructor(
        public httpClient: HttpClient,
        public dialog: MatDialog,
        private userService: UserService,
        private snackbar: SnackbarService
    ) {}

    ngOnInit() {
        this.refreshData();
    }

    refreshData() {
        this.dataSource = new UserDataSource(this.userService, this.paginator, this.sort);
        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(debounceTime(150), distinctUntilChanged())
            .subscribe(() => {
                this.dataSource.filter = this.filter.nativeElement.value;
            });
    }

    addNew() {
        this.dialog
            .open(UserFormDialogComponent, { data: { data: <User>{}, action: 'add' } })
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    this.userService.register(result).subscribe((data) => {
                        this.snackbar.success('Added user successfully!');
                        this.refreshTable();
                    });
                }
            });
    }

    editCall(row) {
        this.dialog
            .open(UserFormDialogComponent, { data: { data: row, action: 'edit' } })
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    this.userService.update(row.id, result).subscribe((data) => {
                        this.snackbar.success('Edited user successfully!');
                        this.refreshTable();
                    });
                }
            });
    }

    deleteItem(row) {
        this.dialog
            .open(UserDeleteDialogComponent, { data: row })
            .afterClosed()
            .subscribe((result) => {
                if (result === 1) {
                    this.userService.delete(row.id).subscribe((data) => {
                        this.snackbar.success('Deleted user successfully!');
                        this.refreshTable();
                    });
                }
            });
    }

    private refreshTable() {
        this.paginator._changePageSize(this.paginator.pageSize);
    }
}
