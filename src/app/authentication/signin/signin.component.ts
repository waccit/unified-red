import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

declare const $: any;

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
    loginForm: FormGroup;
    submitted = false;
    returnUrl: string;
    hide = true;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient
    ) { }

    ngOnInit() {
        this.loginForm = this.formBuilder.group({
            username: [''],
            password: ['']
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

        //    [Focus input] * /
        $('.input100').each(function () {
            $(this).on('blur', function () {
                if (
                    $(this)
                        .val()
                        .trim() != ''
                ) {
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
        } else {
            // this.router.navigate(['/dashboard/main']);
            // var formData: any = new FormData();
            // formData.append("username", this.loginForm.get('username').value);
            // formData.append("password", this.loginForm.get('password').value);
            var formData: any = {
                "username": this.loginForm.get('username').value,
                "password": this.loginForm.get('password').value
            };
            this.http.post('/api/users/authenticate', formData).subscribe(
                (response: any) => {
                    if (response.token) {
                        this.router.navigate(['/dashboard/main']);
                    }
                },
                (error: any) => {
                    console.log(error);
                    if (error.status === 400) {
                        //TODO: toast
                    }
                }
            );
        }

    }
}
