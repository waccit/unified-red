import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthenticationService, UserService, SnackbarService } from '../../services';
import { MustMatch, PasswordStrengthValidator } from './password.validators';
import { User } from '../../data/';

declare const $: any;

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    hide = true;
    chide = true;
    canRegister = false;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private snackbar: SnackbarService
    ) {
        // redirect to home if already logged in
        if (this.authenticationService.tokenValue) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.registerForm = this.formBuilder.group(
            {
                firstName: ['', Validators.required],
                lastName: ['', Validators.required],
                username: ['', [Validators.required, Validators.minLength(3)]],
                email: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
                password: ['', [Validators.required, Validators.minLength(8), PasswordStrengthValidator]],
                cpassword: ['', Validators.required],
            },
            {
                validator: MustMatch('password', 'cpassword'),
            }
        );

        // check if registration is not allowed
        this.userService
            .canRegister()
            .pipe(first())
            .subscribe((data: any) => {
                if (data) {
                    this.canRegister = data.allowed;
                }
            });
    }

    get f() {
        return this.registerForm.controls;
    }

    onSubmit() {
        if (!this.canRegister) {
            return;
        }
        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }
        this.userService
            .register(this.registerForm.value)
            .pipe(first())
            .subscribe(
                (data: User) => {
                    this.router.navigate(['/']);
                    this.snackbar.success('Your new user account was successfully registered!');
                },
                (error) => {
                    this.snackbar.error(error);
                }
            );
    }
}
