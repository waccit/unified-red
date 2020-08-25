import { Injectable } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { RouteInfo } from '../layout/sidebar/sidebar.metadata';

@Injectable({
    providedIn: 'root',
})
export class MenuService {
    private _menuSubject: BehaviorSubject<RouteInfo[]>;
    private _menu: Observable<RouteInfo[]>;
    private _wsSubscription: Subscription;

    constructor(private webSocketService: WebSocketService) {
        this._menuSubject = new BehaviorSubject<RouteInfo[]>([]);
        this._menu = this._menuSubject.asObservable();

        this._wsSubscription = this.webSocketService.listen('ui-controls').subscribe((data: any) => {
            this._menuSubject.next(data.menu);
            console.log('menuService data: ', data);
        });
    }

    get menu() {
        return this._menu;
    }

    cleanUp(): void {
        this._wsSubscription.unsubscribe();
    }
}
