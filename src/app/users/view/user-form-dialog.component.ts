import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { User, RoleName } from '../../data';
import { PasswordStrengthValidator, MustMatch } from '../../authentication/register/password.validators';
import { RoleService, CurrentUserService } from '../../services';
import { first } from 'rxjs/operators';

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
    roles: RoleName[];
    isSelf = false;
    objectKeys = Object.keys;

    constructor(
        public dialogRef: MatDialogRef<UserFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData: any,
        private formBuilder: FormBuilder,
        private roleService: RoleService,
        private currentUserService: CurrentUserService
    ) {
        this.roles = this.roleService.roles ?? [];
        let currentUser = null;
        this.currentUserService.currentUser.pipe(first()).subscribe(user => {
            currentUser = user;
            if (user && this.roles.length) {
                const currentRoleEntry = this.roles.find(r => r.name === user.role)
                    ?? this.roles.find(r => String(r.level) === String(user.role));
                const currentLevel = currentRoleEntry ? parseInt(currentRoleEntry.level) : 0;
                this.roles = this.roles.filter(r => parseInt(r.level) <= currentLevel);
            }
        });
        this.action = this.dialogData.action;
        if (this.action === 'edit') {
            this.data = this.dialogData.data;
            this.title = 'Edit ' + this.data.username;
            const roleEntry = this.roles?.find(r => r.name === this.data.role)
                ?? this.roles?.find(r => String(r.level) === String(this.data.role));
            const roleLevel = roleEntry?.level ?? '';
            this.form = this.formBuilder.group({
                enabled: [this.data.enabled],
                username: [this.data.username, [Validators.required, Validators.minLength(3)]],
                firstName: [this.data.firstName, Validators.required],
                lastName: [this.data.lastName, Validators.required],
                role: [roleLevel, Validators.required],
                email: [this.data.email, [Validators.required, Validators.email, Validators.minLength(5)]],
                expirationDate: [this.data.expirationDate], // [formatDate(this.data.expirationDate, 'MM/dd/yyyy', 'en')],
                sessionExpiration: [this.data.sessionExpiration || ''],
                sessionInactivity: [this.data.sessionInactivity || ''],
        });
            if (currentUser?._id === this.data._id) {
                this.isSelf = true;
                this.form.get('role').disable();
            }
        } else {
            this.title = 'New User';
            this.data = ({} as User);
            this.form = this.formBuilder.group(
                {
                    enabled: [false],
                    username: ['', [Validators.required, Validators.minLength(3)]],
                    firstName: ['', Validators.required],
                    lastName: ['', Validators.required],
                    role: ['', Validators.required],
                    email: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
                    expirationDate: [null], // [formatDate(this.data.expirationDate, 'MM/dd/yyyy', 'en')],
                    password: ['', [Validators.required, Validators.minLength(8), PasswordStrengthValidator]],
                    cpassword: ['', Validators.required],
                    sessionExpiration: [30],
                    sessionInactivity: [30],
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
