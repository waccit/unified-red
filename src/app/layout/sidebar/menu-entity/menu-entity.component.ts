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
    @Input() level: string = 'root'; // root || branch || leaf
    @Input() leafTitle: string = '';
    showMenu: string = '';
    showSubMenu: string = '';

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private renderer: Renderer2,
        public elementRef: ElementRef
    ) {}

    // @HostListener('document:mousedown', ['$event'])
    // onGlobalClick(event): void {
    //     if (!this.elementRef.nativeElement.contains(event.target)) {
    //         this.renderer.removeClass(this.document.body, 'overlay-open');
    //     }
    // }

    // callMenuToggle(event: any, element: any) {
    //     if (element === this.showMenu) {
    //         this.showMenu = '0';
    //     } else {
    //         this.showMenu = element;
    //     }
    //     const hasClass = event.target.classList.contains('toggled');
    //     if (hasClass) {
    //         this.renderer.removeClass(event.target, 'toggled');
    //     } else {
    //         this.renderer.addClass(event.target, 'toggled');
    //     }
    // }

    callSubMenuToggle(element: any) {
        if (element === this.showSubMenu) {
            this.showSubMenu = '0';
        } else {
            this.showSubMenu = element;
        }
    }

    ngOnInit(): void {}
}
