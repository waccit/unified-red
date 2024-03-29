import { DOCUMENT } from '@angular/common';
import { Component, Inject, ElementRef, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { RightSidebarService } from '../../services/rightsidebar.service';
import {
    AuthenticationService,
    CurrentUserService,
    SnackbarService,
    AlarmService,
    WebSocketService,
} from '../../services/';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Alarm, Role } from '../../data';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';

const document: any = window.document;

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.sass'],
})
export class HeaderComponent implements OnInit, OnDestroy {
    newalarm = false;
    recentAlarms: Alarm[] = [];
    site = { name: '', address: '', contactName: '', contactEmail: '', monitorServer: '' };
    showAuditLog = false;
    private _wsSubscription: Subscription;
    private _wsAlarmUpdate: Subscription;

    constructor(
        @Inject(DOCUMENT) private doc: Document,
        private renderer: Renderer2,
        public elementRef: ElementRef,
        private dataService: RightSidebarService,
        public router: Router,
        private authenticationService: AuthenticationService,
        private currentUserService: CurrentUserService,
        private idle: Idle,
        private snackbar: SnackbarService,
        private alarmService: AlarmService,
        private webSocketService: WebSocketService,
        private titleService: Title
    ) {
        this.currentUserService.currentUser.subscribe((user) => {
            if (user) {
                this.setupInactivityMonitor(user.sessionInactivity);
            }
        });
        this.alarmService.getRecentActive().subscribe((alarms) => {
            this.recentAlarms = alarms;
        });
        this.showAuditLog = this.authenticationService.getUserRole() >= Role.Level5; //show/hide audit log link
    }

    ngOnInit(): void {
        this.setStartupStyles();
        this._wsAlarmUpdate = this.webSocketService.listen('ur-alarm-update').subscribe((msg: any) => {
            if (msg && msg.payload) {
                if (msg.action === 'create') {
                    if (msg.payload.state) {
                        // active alarms only
                        this.recentAlarms.unshift(msg.payload);
                        this.recentAlarms.pop();
                        this.snackbar.error(msg.payload.name + ' alarm', null, 5000);
                        this.newalarm = true;
                    }
                } else if (msg.action === 'update') {
                    this.recentAlarms = this.recentAlarms.map((a) => (a._id === msg.payload.id ? msg.payload : a));
                } else if (msg.action === 'delete') {
                    this.recentAlarms = this.recentAlarms.filter((a) => a._id !== msg.payload.id);
                }
            }
        });
        this._wsSubscription = this.webSocketService.listen('ui-controls').subscribe((data: any) => {
            if (data && data.site) {
                this.site = data.site;
                if (this.site && this.site.name) {
                    this.titleService.setTitle(this.site.name + ' - Unified-RED');
                }
            }
        });
    }

    ngOnDestroy(): void {
        if (this._wsAlarmUpdate) {
            this._wsAlarmUpdate.unsubscribe();
        }
        if (this._wsSubscription) {
            this._wsSubscription.unsubscribe();
        }
    }

    setStartupStyles() {
        // set theme on startup
        if (localStorage.getItem('theme')) {
            this.renderer.removeClass(this.doc.body, 'dark');
            this.renderer.removeClass(this.doc.body, 'light');
            this.renderer.addClass(this.doc.body, localStorage.getItem('theme'));
        } else {
            this.renderer.addClass(this.doc.body, 'light');
        }

        // set light sidebar menu on startup
        if (localStorage.getItem('menu_option')) {
            this.renderer.addClass(this.doc.body, localStorage.getItem('menu_option'));
        } else {
            this.renderer.addClass(this.doc.body, 'menu_light');
        }

        // set logo color on startup
        if (localStorage.getItem('choose_logoheader')) {
            this.renderer.addClass(this.doc.body, localStorage.getItem('choose_logoheader'));
        } else {
            this.renderer.addClass(this.doc.body, 'logo-white');
        }
    }
    callFullscreen() {
        if (
            !document.fullscreenElement &&
            !document.mozFullScreenElement &&
            !document.webkitFullscreenElement &&
            !document.msFullscreenElement
        ) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }
    mobileMenuSidebarOpen(event: any, className: string) {
        const hasClass = event.target.classList.contains(className);
        if (hasClass) {
            this.renderer.removeClass(this.doc.body, className);
        } else {
            this.renderer.addClass(this.doc.body, className);
        }
    }
    callSidemenuCollapse() {
        const hasClass = this.doc.body.classList.contains('side-closed');
        if (hasClass) {
            this.renderer.removeClass(this.doc.body, 'side-closed');
            this.renderer.removeClass(this.doc.body, 'submenu-closed');
        } else {
            this.renderer.addClass(this.doc.body, 'side-closed');
            this.renderer.addClass(this.doc.body, 'submenu-closed');
        }
    }
    public toggleRightSidebar(): void {
        this.dataService.changeMsg(
            (this.dataService.currentStatus._isScalar = !this.dataService.currentStatus._isScalar)
        );
    }

    logout() {
        this.authenticationService.logout();
        this.router.navigate(['/authentication/login']);
    }

    setupInactivityMonitor(sessionInactivity: number) {
        if (!sessionInactivity) {
            return;
        }
        this.idle.setIdle(sessionInactivity * 60); // set idle time in seconds
        this.idle.setTimeout(120); // warn for 2 mins before logging out
        this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
        this.idle.onTimeout.subscribe(() => {
            this.logout();
        });
        // this.idle.onIdleEnd.subscribe(() => {
        //     console.log('No longer idle');
        // });
        this.idle.onIdleStart.subscribe(() => {
            this.snackbar.default("You've been idle for sometime...", 'Stay logged in');
        });
        // this.idle.onTimeoutWarning.subscribe((countdown) => {
        // console.log('You will time out in ' + countdown + ' seconds!');
        // });
        this.idle.watch();
    }
}
