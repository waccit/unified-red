import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
// import { formatDate } from '@angular/common';
import { User } from '../../data';
import { PasswordStrengthValidator, MustMatch } from '../../authentication/register/password.validators';

@Component({
    selector: 'app-user-form-dialog',
    templateUrl: './user-form-dialog.component.html',
    styleUrls: ['./user-form-dialog.component.sass'],
    providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-US' }],
})
export class UserFormDialogComponent {
    title: string;
    form: FormGroup;
    action: string;
    data: User;
    hide = true;
    chide = true;

    constructor(
        public dialogRef: MatDialogRef<UserFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData: any,
        private formBuilder: FormBuilder
    ) {
        this.action = dialogData.action;
        if (this.action === 'edit') {
            this.data = dialogData.data;
            this.title = this.data.username + ' - ' + this.data.firstName + ' ' + this.data.lastName;
            this.form = this.formBuilder.group({
                enabled: [this.data.enabled],
                username: [this.data.username, Validators.required],
                firstName: [this.data.firstName, Validators.required],
                lastName: [this.data.lastName, Validators.required],
                email: [this.data.email, [Validators.required, Validators.email, Validators.minLength(5)]],
                expirationDate: [this.data.expirationDate], //[formatDate(this.data.expirationDate, 'MM/dd/yyyy', 'en')],
            });
        } else {
            this.title = 'New User';
            this.data = <User>{};
            this.form = this.formBuilder.group(
                {
                    enabled: [false],
                    username: ['', Validators.required],
                    firstName: ['', Validators.required],
                    lastName: ['', Validators.required],
                    email: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
                    expirationDate: [null], //[formatDate(this.data.expirationDate, 'MM/dd/yyyy', 'en')],
                    password: ['', [Validators.required, Validators.minLength(8), PasswordStrengthValidator]],
                    cpassword: ['', Validators.required],
                },
                {
                    validator: MustMatch('password', 'cpassword'),
                }
            );
        }
    }

    submit() {}

    public confirm(): void {}
}