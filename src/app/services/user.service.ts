/*
Credit to Jason Watmore (https://github.com/cornflourblue) for Angular Registration and Login example.
Source: https://github.com/cornflourblue/angular-8-registration-login-example
*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../authentication/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<User[]>(`/api/users`);
    }

    register(user: User) {
        return this.http.post(`/api/users/register`, user);
    }

    delete(id: number) {
        return this.http.delete(`/api/users/${id}`);
    }
}