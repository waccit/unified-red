import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { RoleFormDialogComponent } from './role-form-dialog.component';
import { SnackbarService, RoleService } from '../../services';
import { RoleDataSource } from '../../data/';

@Component({
    selector: 'app-roles-table',
    templateUrl: './roles-table.component.html',
    styleUrls: ['./roles-table.component.sass'],
})
export class RolesTableComponent implements OnInit {
    displayedColumns = ['level', 'name', 'actions'];
    dataSource: RoleDataSource;

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    constructor(
        public httpClient: HttpClient,
        public dialog: MatDialog,
        private roleService: RoleService,
        private snackbar: SnackbarService
    ) {}

    ngOnInit() {
        this.refreshData();
    }

    refreshData() {
        this.dataSource = new RoleDataSource(this.roleService, this.paginator, this.sort);
    }

    editRole(row) {
        this.dialog
            .open(RoleFormDialogComponent, { data: { data: row } })
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    this.roleService.update(row.level, result).subscribe(
                        (data) => {
                            this.snackbar.success('Edited role successfully!');
                            this.refreshTable();
                        },
                        (error) => {
                            this.snackbar.error(error);
                        }
                    );
                }
            });
    }

    private refreshTable() {
        this.paginator._changePageSize(this.paginator.pageSize);
    }
}
