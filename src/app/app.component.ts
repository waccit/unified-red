import { Component } from '@angular/core';
import { Event, Router, NavigationStart, NavigationEnd, RouterEvent } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { WebSocketService } from './services/web-socket.service';
import { AuthenticationService } from './services/';
import { MenuService } from './services/menu.service';
import { TranslateService } from '@ngx-translate/core'; //Added DI

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
	    public translate: TranslateService, //Added DI
        public _router: Router,
        location: PlatformLocation,
        private authenticationService: AuthenticationService
    ) {
	    translate.addLangs(['en','it']); //Added DI
		translate.setDefaultLang('en'); //Added DI
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
	switchLanguage(lang: string) { //Added DI
	  this.translate.use(lang);
	}
}
