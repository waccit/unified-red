import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { RoleName } from '../../data';

@Component({
    selector: 'app-role-form-dialog',
    templateUrl: './role-form-dialog.component.html',
    styleUrls: ['./role-form-dialog.component.sass'],
})
export class RoleFormDialogComponent {
    title: string;
    form: FormGroup;
    data: RoleName;

    constructor(
        public dialogRef: MatDialogRef<RoleFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData: any,
        private formBuilder: FormBuilder
    ) {
        this.data = dialogData.data;
        this.title = 'Edit Role Level ' + this.data.level;
        this.form = this.formBuilder.group({
            name: [this.data.name, Validators.required],
        });
    }

    submit() {}

    public confirm(): void {}
}
