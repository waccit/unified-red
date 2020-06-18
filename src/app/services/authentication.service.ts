/*
Credit to Jason Watmore (https://github.com/cornflourblue) for Angular Registration and Login example.
Source: https://github.com/cornflourblue/angular-8-registration-login-example
*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private tokenSubject: BehaviorSubject<string>;
    public token: Observable<string>;
    private decodedJwtPayload;

    constructor(private http: HttpClient) {
        this.tokenSubject = new BehaviorSubject<string>(sessionStorage.getItem('token'));
        this.token = this.tokenSubject.asObservable();
        this.decodedJwtPayload = this.decodeJwt();
    }

    public get tokenValue(): string {
        return this.tokenSubject.value;
    }

    login(username, password) {
        return this.http
            .post<any>('/api/users/authenticate', { username, password })
            .pipe(
                map((user) => {
                    // store jwt token in session storage to keep user logged in between page refreshes
                    sessionStorage.setItem('token', user.token);
                    this.tokenSubject.next(user.token);
                    this.decodedJwtPayload = this.decodeJwt();
                    return user.token;
                })
            );
    }

    logout() {
        // remove user from session storage and set current user and token to null
        sessionStorage.removeItem('token');
        this.tokenSubject.next(null);
    }

    forgotPassword(username: string) {
        return this.http.get(`/api/users/forgot/${username}`);
    }

    resetPassword(resetToken: string, password: string) {
        return this.http
            .post<any>(`/api/users/reset/${resetToken}`, { password });
    }

    private decodeJwt() {
        try {
            return JSON.parse(atob(this.tokenSubject.value.split('.')[1]));
        } catch (e) { }
        return { role:0 };
    }

    getUserRole() {
        return this.decodedJwtPayload.role;
    }
}
