import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthenticationService, SnackbarService } from '../../services/';

declare const $: any;

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
    forgotForm: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authenticationService: AuthenticationService,
        private snackbar: SnackbarService
    ) {}

    ngOnInit() {
        this.forgotForm = this.formBuilder.group({
            username: ['', Validators.required],
        });
    }

    get f() {
        return this.forgotForm.controls;
    }

    onSubmit() {
        // stop here if form is invalid
        if (this.forgotForm.invalid) {
            return;
        } else {
            this.authenticationService
                .forgotPassword(this.f.username.value)
                .pipe(first())
                .subscribe(
                    (data) => {
                        console.log(data);
                        this.snackbar.success('Email has been sent to ' + this.f.username.value + '!');
                        this.router.navigate(['/']);
                    },
                    (error) => {
                        console.log(error);
                        this.snackbar.error(error);
                    }
                );
        }
    }
}
