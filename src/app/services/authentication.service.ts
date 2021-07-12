/*
Credit to Jason Watmore (https://github.com/cornflourblue) for Angular Registration and Login example.
Source: https://github.com/cornflourblue/angular-8-registration-login-example
*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NodeRedApiService } from './nodered-api.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private tokenSubject: BehaviorSubject<string>;
    public token: Observable<string>;
    private decodedJwtPayload;

    constructor(private http: HttpClient, private red: NodeRedApiService) {
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
                    // authenticate with Node-RED as well so we can interface with the Node-RED Admin API
                    this.red.login(username, password).subscribe();

                    // store jwt token in session storage to keep user logged in between page refreshes
                    sessionStorage.setItem('token', user.token);
                    this.tokenSubject.next(user.token);
                    this.decodedJwtPayload = this.decodeJwt();
                    return user.token;
                })
            );
    }

    logout() {
        // remove user from session storage, set token to null, and logout of Node-RED
        sessionStorage.removeItem('token');
        this.tokenSubject.next(null);
        this.red.logout();
    }

    forgotPassword(username: string) {
        return this.http.get(`/api/users/forgot/${username}`);
    }

    resetPassword(resetToken: string, password: string) {
        return this.http.post<any>(`/api/users/reset/${resetToken}`, { password });
    }

    private decodeJwt() {
        try {
            return JSON.parse(atob(this.tokenSubject.value.split('.')[1]));
        } catch (e) {}
        return { role: 0 };
    }

    getUserRole() {
        return this.decodedJwtPayload.role;
    }
}
