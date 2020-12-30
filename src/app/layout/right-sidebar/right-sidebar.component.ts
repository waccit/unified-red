import { DOCUMENT } from '@angular/common';
import { Component, Inject, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { RightSidebarService } from '../../services/rightsidebar.service';
import { Role } from '../../data/';
import { AuthenticationService } from '../../services/';
@Component({
    selector: 'app-right-sidebar',
    templateUrl: './right-sidebar.component.html',
    styleUrls: ['./right-sidebar.component.sass'],
})
export class RightSidebarComponent implements OnInit {
    menuOption = 'menu_light';
    theme = 'light';
    selectedBgColor = 'black';
    maxHeight: string;
    maxWidth: string;
    showpanel = false;
    showSettings = false;
    isOpenSidebar = false;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private renderer: Renderer2,
        public elementRef: ElementRef,
        private dataService: RightSidebarService,
        private authenticationService: AuthenticationService
    ) {
        this.dataService.currentStatus.subscribe((data: boolean) => {
            this.isOpenSidebar = data;
            this.showSettings = this.authenticationService.getUserRole() === Role.Level4; // show/hide settings tab
        });
    }

    ngOnInit() {
        this.setRightSidebarWindowHeight();
        // set theme on startup
        if (localStorage.getItem('theme') === 'dark') {
            this.darkTheme();
        } else {
            this.lightTheme();
        }
        // set menu color on startup
        if (localStorage.getItem('menu_option') === 'menu_dark') {
            this.darkSidebar();
        } else {
            this.lightSidebar();
        }
        // set header color on startup
        let choose_skin = localStorage.getItem('choose_skin');
        if (choose_skin) {
            this.renderer.addClass(this.document.body, choose_skin);
            this.selectedBgColor = localStorage.getItem('choose_skin_active');
        } else {
            this.renderer.addClass(this.document.body, 'theme-' + this.selectedBgColor);
        }
    }

    selectTheme(e) {
        this.selectedBgColor = e;
        const prevTheme = this.elementRef.nativeElement
            .querySelector('.right-sidebar .demo-choose-skin li.actived')
            .getAttribute('data-theme');
        this.renderer.removeClass(this.document.body, 'theme-' + prevTheme);
        this.renderer.addClass(this.document.body, 'theme-' + this.selectedBgColor);
        localStorage.setItem('choose_skin', 'theme-' + this.selectedBgColor);
        localStorage.setItem('choose_skin_active', this.selectedBgColor);
    }

    lightSidebar() {
        this.renderer.removeClass(this.document.body, 'menu_dark');
        this.renderer.removeClass(this.document.body, 'logo-black');
        this.renderer.addClass(this.document.body, 'menu_light');
        this.renderer.addClass(this.document.body, 'logo-white');
        this.menuOption = 'menu_light';
        localStorage.setItem('choose_logoheader', 'logo-white');
        localStorage.setItem('menu_option', this.menuOption);
    }

    darkSidebar() {
        this.renderer.removeClass(this.document.body, 'menu_light');
        this.renderer.removeClass(this.document.body, 'logo-white');
        this.renderer.addClass(this.document.body, 'menu_dark');
        this.renderer.addClass(this.document.body, 'logo-black');
        this.menuOption = 'menu_dark';
        localStorage.setItem('choose_logoheader', 'logo-black');
        localStorage.setItem('menu_option', this.menuOption);
    }

    lightTheme() {
        this.renderer.removeClass(this.document.body, 'dark');
        this.renderer.removeClass(this.document.body, 'submenu-closed');
        this.renderer.addClass(this.document.body, 'light');
        this.renderer.addClass(this.document.body, 'submenu-closed');
        this.theme = 'light';
        localStorage.setItem('theme', this.theme);
    }

    darkTheme() {
        this.renderer.removeClass(this.document.body, 'light');
        this.renderer.removeClass(this.document.body, 'submenu-closed');
        this.renderer.addClass(this.document.body, 'dark');
        this.renderer.addClass(this.document.body, 'submenu-closed');
        this.theme = 'dark';
        localStorage.setItem('theme', this.theme);
    }

    setRightSidebarWindowHeight() {
        const height = window.innerHeight - 137;
        this.maxHeight = height + '';
        this.maxWidth = '500px';
    }

    toggleRightSidebar(): void {
        this.dataService.changeMsg(
            (this.dataService.currentStatus._isScalar = !this.dataService.currentStatus._isScalar)
        );
    }
}
