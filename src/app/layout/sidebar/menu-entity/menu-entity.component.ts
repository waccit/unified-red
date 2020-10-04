import { DOCUMENT } from '@angular/common';
import { Component, OnInit, Input, Renderer2, HostListener, ElementRef, Inject } from '@angular/core';
import { RouteInfo } from '../sidebar.metadata';

@Component({
    selector: 'app-menu-entity',
    templateUrl: './menu-entity.component.html',
    styleUrls: ['./menu-entity.component.sass'],
})
export class MenuEntityComponent implements OnInit {
    @Input() sidebarItems: RouteInfo[];
    showMenu = '';
    showSubMenu = '';

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private renderer: Renderer2,
        public elementRef: ElementRef
    ) {}

    callSubMenuToggle(element: any) {
        if (element === this.showSubMenu) {
            this.showSubMenu = '0';
        } else {
            this.showSubMenu = element;
        }
    }

    ngOnInit(): void {}
}
