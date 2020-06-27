import { Injectable } from '@angular/core';
import { User } from '../data';
import { WebSocketService } from './web-socket.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
    private currentUserSubject: BehaviorSubject<User> = new BehaviorSubject<User>(null);
    public currentUser: Observable<User> = this.currentUserSubject.asObservable();

    constructor(private userService: UserService, private webSocketService: WebSocketService) {
        this.userService.getCurrent().subscribe(user => {
            this.currentUserSubject.next(user);
            this.webSocketService.listen('ur-user-update').subscribe((data: any) => {
                // filter on user id
                if (this.currentUserSubject.value && data.id === this.currentUserSubject.value.id) {
                    this.currentUserSubject.next(data);
                }
            });
        });
    }
}
