import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

@Component({
    selector: 'app-user-delete-dialog',
    templateUrl: './user-delete-dialog.component.html',
    styleUrls: ['./user-delete-dialog.component.sass'],
})
export class UserDeleteDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<UserDeleteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData: any
    ) {}

    confirm(): void {
    }
}
