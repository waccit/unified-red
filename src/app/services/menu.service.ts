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
    private _pages = {};
    private _pagesSubject = new BehaviorSubject<{}>(this._pages);
    private _wsSubscription: Subscription;

    constructor(private webSocketService: WebSocketService) {
        this._menuSubject = new BehaviorSubject<RouteInfo[]>([]);
        this._menu = this._menuSubject.asObservable();

        this._wsSubscription = this.webSocketService.listen('ui-controls').subscribe((data: any) => {
            this._menuSubject.next(data.menu);
            console.log('menuService data: ', data);
            this.findPages(data.menu);
        });
    }

    private findPages(menu: any) {
        if (menu && Array.isArray(menu) && menu.length) {
            for (let m of menu) {
                this.findPages(m);
            }
        }
        else if (menu.isPage) {
            if (menu.instance) {
                menu.instance._idVar = this.getIdVar(menu);
            }
            this._pages[menu.id] = menu;
        }
        else if (menu.submenu && menu.submenu.length) {
            this.findPages(menu.submenu);
        }
    }

    private getIdVar(page) {
        let p = page.instance?.parameters;
        if (p) {
            return Object.keys(p).reduce((a, b) => (a + p[a] == page.instance?._id ? a : b));
        }
    }

    get menu() {
        return this._menu;
    }

    get pages() {
        return this._pagesSubject.asObservable();
    }

    cleanUp(): void {
        this._wsSubscription.unsubscribe();
    }
}
