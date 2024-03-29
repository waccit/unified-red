import { DOCUMENT } from '@angular/common';
import { Component, OnInit, Input, Renderer2, HostListener, ElementRef, Inject } from '@angular/core';
import { User } from '../../../data';
import { CurrentUserService } from '../../../services';
import { RouteInfo } from '../sidebar.metadata';

@Component({
    selector: 'app-menu-entity',
    templateUrl: './menu-entity.component.html',
    styleUrls: ['./menu-entity.component.sass'],
})
export class MenuEntityComponent implements OnInit {
    @Input() sidebarItems: RouteInfo[];
    showSubMenu = '';
    private userRole: string;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private renderer: Renderer2,
        public elementRef: ElementRef,
        private currentUserService: CurrentUserService
    ) {}

    callSubMenuToggle(event: any, element: any) {
        if (element === this.showSubMenu) {
            this.showSubMenu = '0';
        } else {
            this.showSubMenu = element;
        }
        const hasClass = event.target.classList.contains('toggled');
        if (hasClass) {
            this.renderer.removeClass(event.target, 'toggled');
        } else {
            this.renderer.addClass(event.target, 'toggled');
        }
    }

    ngOnInit(): void {
        this.currentUserService.currentUser.subscribe((user: User) => {
            if (user) {
                this.userRole = user.role;
            }
        });
    }

    hasAccess(access) {
        if (!access) access = 0;

        return this.userRole >= access;
    }
}
