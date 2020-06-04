/*
Credit to Jason Watmore (https://github.com/cornflourblue) for Angular Registration and Login example.
Source: https://github.com/cornflourblue/angular-8-registration-login-example
*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../data/';


@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    private _currentUser: User;
    private tokenSubject: BehaviorSubject<string>;
    public token: Observable<string>;
    private roleSubject: BehaviorSubject<string>;
    public role: Observable<string>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(this._currentUser);
        this.currentUser = this.currentUserSubject.asObservable();
        this.tokenSubject = new BehaviorSubject<string>(sessionStorage.getItem('token'));
        this.token = this.tokenSubject.asObservable();
        this.roleSubject = new BehaviorSubject<string>(sessionStorage.getItem('role'));
        this.role = this.roleSubject.asObservable();
    }

    public get userValue(): User {
        return this.currentUserSubject.value;
    }

    public get tokenValue(): string {
        return this.tokenSubject.value;
    }

    public get roleValue(): string {
        return this.roleSubject.value;
    }

    login(username, password) {
        return this.http
            .post<any>('/api/users/authenticate', { username, password })
            .pipe(
                map((user) => {
                    // store user details and jwt token in session storage to keep user logged in between page refreshes
                    sessionStorage.setItem('token', user.token);
                    sessionStorage.setItem('role', user.role);
                    console.log("authentication.service user.role", user.role);
                    this.currentUserSubject.next(user);
                    this.tokenSubject.next(user.token);
                    return user.token;
                })
            );
    }

    logout() {
        // remove user from session storage and set current user and token to null
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        this.currentUserSubject.next(null);
        this.tokenSubject.next(null);
    }

    forgotPassword(username: string) {
        return this.http.get(`/api/users/forgot/${username}`);
    }

    resetPassword(resetToken: string, password: string) {
        return this.http
            .post<any>(`/api/users/reset/${resetToken}`, { password });
    }

}
