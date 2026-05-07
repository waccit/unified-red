import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { AbstractControl, ValidationErrors, Validators, FormGroup, FormBuilder } from '@angular/forms';
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
        const existingNames: string[] = dialogData.existingNames || [];
        this.title = 'Edit Role Level ' + this.data.level;
        this.form = this.formBuilder.group({
            name: [this.data.name, [Validators.required, this.uniqueNameValidator(existingNames, this.data.name)]],
        });
    }

    private uniqueNameValidator(existingNames: string[], currentName: string) {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = (control.value || '').trim().toLowerCase();
            const current = (currentName || '').trim().toLowerCase();
            if (value === current) return null;
            return existingNames.some((n) => n.trim().toLowerCase() === value) ? { nameTaken: true } : null;
        };
    }

    submit() {}

    public confirm(): void {}
}
