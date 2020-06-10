import { DOCUMENT } from '@angular/common';
import {Component, Inject, ElementRef, OnInit, Renderer2, } from '@angular/core';
import { first } from 'rxjs/operators';
import { RightSidebarService } from '../../services/rightsidebar.service';
import { Observable } from 'rxjs';
import { User, Role } from '../../data/';
import { AuthenticationService } from '../../services/';
@Component({
    selector: 'app-right-sidebar',
    templateUrl: './right-sidebar.component.html',
    styleUrls: ['./right-sidebar.component.sass'],
})
export class RightSidebarComponent implements OnInit {
    selectedBgColor: string = 'black';
    maxHeight: string;
    maxWidth: string;
    showpanel: boolean = false;
    private userRole: Role;
    public currentUser: Observable<User>;
    
    showSettings: boolean;
    isOpenSidebar: boolean;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private renderer: Renderer2,
        public elementRef: ElementRef,
        private dataService: RightSidebarService,
        private authenticationService: AuthenticationService,
    ) {}

    ngOnInit() {
        this.dataService.currentStatus.subscribe((data: boolean) => {
            this.isOpenSidebar = data;
            this.checkUserPrivillages();
        });

        this.setRightSidebarWindowHeight();
        // set header color on startup
        if (localStorage.getItem('choose_skin')) {
            this.renderer.addClass(
                this.document.body,
                localStorage.getItem('choose_skin')
            );
            this.selectedBgColor = localStorage.getItem('choose_skin_active');
        } else {
            this.renderer.addClass(
                this.document.body,
                'theme-' + this.selectedBgColor
            );
        }

    }

    checkUserPrivillages(){
        this.authenticationService.currentUser.pipe(first()).subscribe(
            (user: User) => {
                this.userRole = user.role;
                this.showSettings = (this.userRole === 10) ? true : false;
            },
            (error) => {
                console.log(error);
            }
            );
    }
    selectTheme(e) {
        this.selectedBgColor = e;
        var prevTheme = this.elementRef.nativeElement
            .querySelector('.right-sidebar .demo-choose-skin li.actived')
            .getAttribute('data-theme');
        this.renderer.removeClass(this.document.body, 'theme-' + prevTheme);
        this.renderer.addClass(
            this.document.body,
            'theme-' + this.selectedBgColor
        );
        localStorage.setItem('choose_skin', 'theme-' + this.selectedBgColor);
        localStorage.setItem('choose_skin_active', this.selectedBgColor);
    }

    lightSidebarBtnClick() {
        this.renderer.removeClass(this.document.body, 'menu_dark');
        this.renderer.removeClass(this.document.body, 'logo-black');
        this.renderer.addClass(this.document.body, 'menu_light');
        this.renderer.addClass(this.document.body, 'logo-white');
        var menu_option = 'menu_light';
        localStorage.setItem('choose_logoheader', 'logo-white');
        localStorage.setItem('menu_option', menu_option);
    }
    darkSidebarBtnClick() {
        this.renderer.removeClass(this.document.body, 'menu_light');
        this.renderer.removeClass(this.document.body, 'logo-white');
        this.renderer.addClass(this.document.body, 'menu_dark');
        this.renderer.addClass(this.document.body, 'logo-black');
        var menu_option = 'menu_dark';
        localStorage.setItem('choose_logoheader', 'logo-black');
        localStorage.setItem('menu_option', menu_option);
    }
    lightThemeBtnClick() {
        this.renderer.removeClass(this.document.body, 'dark');
        this.renderer.removeClass(this.document.body, 'submenu-closed');
        this.renderer.removeClass(this.document.body, 'menu_dark');
        this.renderer.removeClass(this.document.body, 'logo-black');
        this.renderer.addClass(this.document.body, 'light');
        this.renderer.addClass(this.document.body, 'submenu-closed');
        this.renderer.addClass(this.document.body, 'menu_light');
        this.renderer.addClass(this.document.body, 'logo-white');
        var theme = 'light';
        var menu_option = 'menu_light';
        localStorage.setItem('choose_logoheader', 'logo-white');
        localStorage.setItem('choose_skin', 'theme-black');
        localStorage.setItem('theme', theme);
        localStorage.setItem('menu_option', menu_option);
    }
    darkThemeBtnClick() {
        this.renderer.removeClass(this.document.body, 'light');
        this.renderer.removeClass(this.document.body, 'submenu-closed');
        this.renderer.removeClass(this.document.body, 'menu_light');
        this.renderer.removeClass(this.document.body, 'logo-white');
        this.renderer.addClass(this.document.body, 'dark');
        this.renderer.addClass(this.document.body, 'submenu-closed');
        this.renderer.addClass(this.document.body, 'menu_dark');
        this.renderer.addClass(this.document.body, 'logo-black');

        var theme = 'dark';
        var menu_option = 'menu_dark';
        localStorage.setItem('choose_logoheader', 'logo-black');
        localStorage.setItem('choose_skin', 'theme-black');
        localStorage.setItem('theme', theme);
        localStorage.setItem('menu_option', menu_option);
    }

    setRightSidebarWindowHeight() {
        var height = window.innerHeight - 137;
        this.maxHeight = height + '';
        this.maxWidth = '500px';
    }
    toggleRightSidebar(): void {
        this.dataService.changeMsg(
            (this.dataService.currentStatus._isScalar = !this.dataService
                .currentStatus._isScalar)
        );
    }
}
