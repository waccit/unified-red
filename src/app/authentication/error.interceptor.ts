/*
Credit to Jason Watmore (https://github.com/cornflourblue) for Angular Registration and Login example.
Source: https://github.com/cornflourblue/angular-8-registration-login-example
*/

import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '../services/';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log("ErrorInterceptor");
        return next.handle(request).pipe(catchError(err => {
            console.log("ErrorInterceptor: error: " + err.status);
            if (err.status === 401) {
                console.log("ErrorInterceptor: lougout and reload");
                // auto logout if 401 response returned from api
                this.authenticationService.logout();
                location.reload(true);
            }
            
            console.log("ErrorInterceptor: throw error");
            const error = err.error.message || err.statusText;
            return throwError(error);
        }))
    }
}