import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthenticationService, SnackbarService } from '../../services/';
import { MustMatch, PasswordStrengthValidator } from '../register/password.validators';

declare const $: any;

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
    resetForm: FormGroup;
    resetToken: string;
    hide = true;
    chide = true;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private snackbar: SnackbarService
    ) {}

    ngOnInit() {
        this.resetForm = this.formBuilder.group(
            {
                password: ['', [Validators.required, Validators.minLength(8), PasswordStrengthValidator]],
                cpassword: ['', Validators.required],
            },
            {
                validator: MustMatch('password', 'cpassword'),
            }
        );

        this.route.params.subscribe((params) => {
            this.resetToken = params.resetToken;
        });
    }
    get f() {
        return this.resetForm.controls;
    }

    onSubmit() {
        // stop here if form is invalid
        if (this.resetForm.invalid) {
            return;
        } else {
            this.authenticationService
                .resetPassword(this.resetToken, this.f.password.value)
                .pipe(first())
                .subscribe(
                    (data) => {
                        this.snackbar.success('Your password has been changed!');
                        this.router.navigate(['/']);
                    },
                    (error) => {
                        this.snackbar.error(error);
                    }
                );
        }
    }
}
