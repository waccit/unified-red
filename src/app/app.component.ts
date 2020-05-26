import { Component } from '@angular/core';
import {
    Event,
    Router,
    NavigationStart,
    NavigationEnd,
    RouterEvent
} from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { WebSocketService } from './services/web-socket.service';
import { AuthenticationService } from './services/';
import { User } from './authentication/user.model';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    currentUrl: string;
    showLoadingIndicatior = true;
    sidebarItems: any[] = [];
    currentUser: User;

    constructor(public _router: Router, location: PlatformLocation, private webSocketService: WebSocketService, private authenticationService: AuthenticationService) {
        console.log("AppComponent Constructor Called");
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
        this._router.events.subscribe((routerEvent: Event) => {
            if (routerEvent instanceof NavigationStart) {
                this.showLoadingIndicatior = true;
                location.onPopState(() => {
                    window.location.reload();
                });
                this.currentUrl = routerEvent.url.substring(
                    routerEvent.url.lastIndexOf('/') + 1
                );
            }
            if (routerEvent instanceof NavigationEnd) {
                this.showLoadingIndicatior = false;
            }
            window.scrollTo(0, 0);
        });

        this.webSocketService.listen('ui-controls').subscribe( (data: any) => {
            this.sidebarItems = [
                {
                    path: '',
                    title: '-- Main',
                    icon: '',
                    class: 'header',
                    groupTitle: true,
                    submenu: []
                },
                {
                    path: '',
                    title: data.menu[0].header,
                    icon: 'menu-icon mdc-' + data.menu[0].icon,
                    class: 'menu-toggle',
                    groupTitle: false,
                    submenu: [
                        {
                            path: '/',
                            title: data.menu[0].items[0].header,
                            icon: '',
                            class: 'ml-sub-menu',
                            groupTitle: false,
                            submenu: [
                                {
                                    path: '/', // /dashboard/demo
                                    title: data.menu[0].items[0].items[0].header.config.name,
                                    icon: '',
                                    class: '',
                                    groupTitle: false,
                                    submenu: []
                                },
                            ]
                        }
                    ]
                }
            ]
        });
    }

}
