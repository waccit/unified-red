import { DOCUMENT } from '@angular/common';
import {
    Component,
    Inject,
    ElementRef,
    OnInit,
    Renderer2,
    HostListener,
} from '@angular/core';
import { Router } from '@angular/router';
import { RightSidebarService } from '../../services/rightsidebar.service';
import { AuthenticationService, UserService, SnackbarService } from '../../services/';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';

const document: any = window.document;

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.sass'],
})
export class HeaderComponent implements OnInit {
    
    constructor(
        @Inject(DOCUMENT) private document: Document,
        private renderer: Renderer2,
        public elementRef: ElementRef,
        private dataService: RightSidebarService,
        public router: Router,
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private idle: Idle,
        private snackbar: SnackbarService
    ) {
        this.userService.currentUser.subscribe(user => { 
            if (user) {
                this.setupInactivityMonitor(user.sessionInactivity);
            }
        });
    }

    notifications: Object[] = [
        {
            userImg: 'assets/images/user/user1.jpg',
            userName: 'Sarah Smith',
            time: '14 mins ago',
            message: 'Please check your mail',
        },
        {
            userImg: 'assets/images/user/user2.jpg',
            userName: 'Airi Satou',
            time: '22 mins ago',
            message: 'Work Completed !!!',
        },
        {
            userImg: 'assets/images/user/user3.jpg',
            userName: 'John Doe',
            time: '3 hours ago',
            message: 'kindly help me for code.',
        },
        {
            userImg: 'assets/images/user/user4.jpg',
            userName: 'Ashton Cox',
            time: '5 hours ago',
            message: 'Lets break for lunch...',
        },
        {
            userImg: 'assets/images/user/user5.jpg',
            userName: 'Sarah Smith',
            time: '14 mins ago',
            message: 'Please check your mail',
        },
        {
            userImg: 'assets/images/user/user6.jpg',
            userName: 'Airi Satou',
            time: '22 mins ago',
            message: 'Work Completed !!!',
        },
        {
            userImg: 'assets/images/user/user7.jpg',
            userName: 'John Doe',
            time: '3 hours ago',
            message: 'kindly help me for code.',
        },
    ];

    ngOnInit() {
        this.setStartupStyles();
    }

    setStartupStyles() {
        //set theme on startup
        if (localStorage.getItem('theme')) {
            this.renderer.removeClass(this.document.body, 'dark');
            this.renderer.removeClass(this.document.body, 'light');
            this.renderer.addClass(
                this.document.body,
                localStorage.getItem('theme')
            );
        } else {
            this.renderer.addClass(this.document.body, 'light');
        }

        // set light sidebar menu on startup
        if (localStorage.getItem('menu_option')) {
            this.renderer.addClass(
                this.document.body,
                localStorage.getItem('menu_option')
            );
        } else {
            this.renderer.addClass(this.document.body, 'menu_light');
        }

        // set logo color on startup
        if (localStorage.getItem('choose_logoheader')) {
            this.renderer.addClass(
                this.document.body,
                localStorage.getItem('choose_logoheader')
            );
        } else {
            this.renderer.addClass(this.document.body, 'logo-white');
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
            this.renderer.removeClass(this.document.body, className);
        } else {
            this.renderer.addClass(this.document.body, className);
        }
    }
    callSidemenuCollapse() {
        const hasClass = this.document.body.classList.contains('side-closed');
        if (hasClass) {
            this.renderer.removeClass(this.document.body, 'side-closed');
            this.renderer.removeClass(this.document.body, 'submenu-closed');
        } else {
            this.renderer.addClass(this.document.body, 'side-closed');
            this.renderer.addClass(this.document.body, 'submenu-closed');
        }
    }
    public toggleRightSidebar(): void {
        this.dataService.changeMsg(
            (this.dataService.currentStatus._isScalar = !this.dataService
                .currentStatus._isScalar)
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
            this.logout()
        });
        // this.idle.onIdleEnd.subscribe(() => { 
        //     console.log('No longer idle');
        // });
        this.idle.onIdleStart.subscribe(() => {
            this.snackbar.default("You've been idle for sometime...", "Stay logged in");
        });
        // this.idle.onTimeoutWarning.subscribe((countdown) => {
            // console.log('You will time out in ' + countdown + ' seconds!');
        // });
        this.idle.watch();
    }
}
