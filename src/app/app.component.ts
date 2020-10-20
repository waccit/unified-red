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
    showLoadingIndicator = true;
    isLoggedIn = false;

    constructor(
        public _router: Router,
        location: PlatformLocation,
        private authenticationService: AuthenticationService
    ) {
        this.authenticationService.token.subscribe((token) => {
            this.isLoggedIn = !!token;
        });
        this._router.events.subscribe((routerEvent: Event) => {
            if (routerEvent instanceof NavigationStart) {
                this.showLoadingIndicator = true;
                location.onPopState(() => {
                    window.location.reload();
                });
                this.currentUrl = routerEvent.url.substring(routerEvent.url.lastIndexOf('/') + 1);
            }
            if (routerEvent instanceof NavigationEnd) {
                this.showLoadingIndicator = false;
            }
            window.scrollTo(0, 0);
        });
    }
}
