import { Component } from '@angular/core';
import { Event, Router, NavigationStart, NavigationEnd, RouterEvent } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { WebSocketService } from './services/web-socket.service';
import { AuthenticationService } from './services/';
import { MenuService } from './services/menu.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    currentUrl: string;
    showLoadingIndicatior = true;
    // sidebarItems: any[] = [];
    isLoggedIn = false;

    constructor(
        public _router: Router,
        location: PlatformLocation,
        // private webSocketService: WebSocketService,
        // private menuService: MenuService,
        private authenticationService: AuthenticationService
    ) {
        console.log('AppComponent Constructor Called');
        this.authenticationService.token.subscribe((token) => {
            this.isLoggedIn = !!token;
        });
        this._router.events.subscribe((routerEvent: Event) => {
            if (routerEvent instanceof NavigationStart) {
                this.showLoadingIndicatior = true;
                location.onPopState(() => {
                    window.location.reload();
                });
                this.currentUrl = routerEvent.url.substring(routerEvent.url.lastIndexOf('/') + 1);
            }
            if (routerEvent instanceof NavigationEnd) {
                this.showLoadingIndicatior = false;
            }
            window.scrollTo(0, 0);
        });

        // this.menuService.menu.subscribe((data) => {
        //     this.sidebarItems = data;
        // });

        // this.webSocketService.listen('ui-controls').subscribe((data: any) => {
        //     console.log('app.component listening to WebSocketService data: ', data);
        //     this.sidebarItems = [];
        //     this.sidebarItems = data.menu;
        //     // this.pageGroupsService.setPageGroupsList(data.menu);
        // });
    }
}
