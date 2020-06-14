/*
Credit to Jason Watmore (https://github.com/cornflourblue) for Angular Registration and Login example.
Source: https://github.com/cornflourblue/angular-8-registration-login-example
*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService} from './user.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private tokenSubject: BehaviorSubject<string>;
    public token: Observable<string>;
    private decodedJwtPayload = { role:0 };

    constructor(private http: HttpClient, private userService: UserService) {
        this.tokenSubject = new BehaviorSubject<string>(sessionStorage.getItem('token'));
        this.token = this.tokenSubject.asObservable();
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
                    //decode jwt token and store in memory
                    try {
                        this.decodedJwtPayload = JSON.parse(atob(this.tokenSubject.value.split('.')[1]));
                    } catch (e) { }
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

    getUserRole() {
        return this.decodedJwtPayload.role;
    }
}
