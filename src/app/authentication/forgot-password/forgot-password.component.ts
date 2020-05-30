import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
    submitted = false;
    returnUrl: string;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private snackbar: SnackbarService
    ) {}

    ngOnInit() {
        this.forgotForm = this.formBuilder.group({
            username: ['', Validators.required],
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
    }
    get f() {
        return this.forgotForm.controls;
    }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.forgotForm.invalid) {
            return;
        } else {
            this.authenticationService
            .forgotPassword(this.f.username.value)
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
            this.snackbar.success('Email Has Been Sent to '+this.f.username.value+'!');
        }
    }
}