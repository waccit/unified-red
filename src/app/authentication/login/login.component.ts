import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthenticationService, SnackbarService } from '../../services';

declare const $: any;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    submitted = false;
    returnUrl: string;
    registeredUser: string;
    hide = true;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private snackbar: SnackbarService
    ) {
        // redirect to home if already logged in
        if (this.authenticationService.tokenValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.registeredUser = this.route.snapshot.queryParams["registered"] || '';

        this.loginForm = this.formBuilder.group({
            username: [this.registeredUser, Validators.required],
            password: ['', Validators.required],
        });

        //    [Focus input] * /
        $('.input100').each(function () {
            $(this).on('blur', function () {
                if ($(this).val().trim() != '') {
                    $(this).addClass('has-val');
                } else {
                    $(this).removeClass('has-val');
                }
            });
        });
    }

    get f() {
        return this.loginForm.controls;
    }

    onSubmit() {
        this.submitted = true;
        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }
        this.authenticationService
            .login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                (data) => {
                    this.router.navigate([this.returnUrl]);
                },
                (error) => {
                    this.snackbar.error(error);
                }
            );
    }
}
