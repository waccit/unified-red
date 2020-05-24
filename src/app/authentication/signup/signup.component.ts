import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthenticationService, UserService } from '../../services/';

declare const $: any;

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
    registerForm: FormGroup;
    submitted = false;
    returnUrl: string;
    hide = true;
    chide = true;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private userService: UserService
    ) {
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.registerForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            username: ['', Validators.required],
            email: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            cpassword: ['', [Validators.required, Validators.minLength(8)]]
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
        return this.registerForm.controls;
    }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }
        this.userService.register(this.registerForm.value).pipe(first()).subscribe(
            data => {
                // this.alertService.success('Registration successful', true);
                this.router.navigate(['/authentication/login']);
            },
            error => {
                console.log(error);
                // this.alertService.error(error);
                // TODO: toast
                // this.loading = false;
            });
    }
}
