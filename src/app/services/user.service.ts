/*
Credit to Jason Watmore (https://github.com/cornflourblue) for Angular Registration and Login example.
Source: https://github.com/cornflourblue/angular-8-registration-login-example
*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../data/';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) {}

    getAll() {
        return this.http.get<User[]>(`/api/users`);
    }

    canRegister() {
        return this.http.get(`/api/users/register`);
    }

    register(user: User) {
        return this.http.post(`/api/users/register`, user);
    }

    delete(id: string) {
        return this.http.delete(`/api/users/${id}`);
    }

    getCurrent() {
        return this.http.get<User>(`/api/users/current`);
    }

    getById(id: string) {
        return this.http.get<User>(`/api/users/${id}`);
    }

    add(user: User) {
        return this.http.post(`/api/users`, user);
    }

    update(id: string, user: any) {
        return this.http.put<User>(`/api/users/${id}`, user);
    }
}
