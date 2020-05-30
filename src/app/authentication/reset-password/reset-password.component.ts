import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthenticationService, SnackbarService } from '../../services/';

declare const $: any;

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
    resetForm: FormGroup;
    submitted = false;
    returnUrl: string;

    resetToken: string;
    private sub: any;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private snackbar: SnackbarService
    ) {}

    ngOnInit() {
        this.resetForm = this.formBuilder.group({
            password: ['', Validators.required],
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

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

        this.sub = this.route.params.subscribe(params => {
            this.resetToken = params['resetToken'];
        });
    }
    get f() {
        return this.resetForm.controls;
    }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.resetForm.invalid) {
            return;
        } else {
            this.authenticationService
            .resetPassword(this.resetToken, this.f.password.value)
            .pipe(first())
            .subscribe(
                (data) => {
                    this.router.navigate([this.returnUrl]);
                    console.log(data);
                },
                (error) => {
                    console.log(error);
                    this.snackbar.error(error);
                }
            );
            this.snackbar.success('Your password has been changed!');
        }
    }
}
