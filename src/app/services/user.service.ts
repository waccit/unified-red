/*
Credit to Jason Watmore (https://github.com/cornflourblue) for Angular Registration and Login example.
Source: https://github.com/cornflourblue/angular-8-registration-login-example
*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../data/';
import { WebSocketService } from './web-socket.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private currentUserSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);
    public currentUser: Observable<User> = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private webSocketService: WebSocketService) {
        this.getCurrent().subscribe(user => {
            this.currentUserSubject.next(user);
            this.webSocketService.listen('ur-user-update').subscribe((data: any) => {
                // filter on user id
                if (this.currentUserSubject.value && data.id === this.currentUserSubject.value.id) {
                    this.currentUserSubject.next(data);
                }
            });
        });
    }

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

    update(id: string, user: any) {
        return this.http.put<User>(`/api/users/${id}`, user);
    }

}
