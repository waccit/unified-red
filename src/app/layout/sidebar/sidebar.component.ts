import { DOCUMENT } from '@angular/common';
import { Component, Inject, ElementRef, OnInit, Renderer2, HostListener, Input } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { RouteInfo } from './sidebar.metadata';
// import { ROUTES } from './sidebar-items';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.sass'],
})
export class SidebarComponent implements OnInit {
    // @Input() sidebarItems: any[];
    sidebarItems: RouteInfo[];
    showMenu = '';
    showSubMenu = '';
    public innerHeight: any;
    public bodyTag: any;
    listMaxHeight: string;
    listMaxWidth: string;
    headerHeight = 60;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private renderer: Renderer2,
        public elementRef: ElementRef,
        private menuService: MenuService
    ) {}

    @HostListener('window:resize', ['$event'])
    windowResizeCall(event) {
        this.setMenuHeight();
        this.checkStatusForResize(false);
    }

    @HostListener('document:mousedown', ['$event'])
    onGlobalClick(event): void {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.renderer.removeClass(this.document.body, 'overlay-open');
        }
    }

    callMenuToggle(event: any, element: any) {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
        const hasClass = event.target.classList.contains('toggled');
        if (hasClass) {
            this.renderer.removeClass(event.target, 'toggled');
        } else {
            this.renderer.addClass(event.target, 'toggled');
        }
    }

    ngOnInit() {
        this.menuService.menu.subscribe((menu: RouteInfo[]) => {
            this.sidebarItems = menu;
        });
        this.initLeftSidebar();
        this.bodyTag = this.document.body;
    }

    initLeftSidebar() {
        // Set menu height
        this.setMenuHeight();
        this.checkStatusForResize(true);
    }

    setMenuHeight() {
        this.innerHeight = window.innerHeight;
        const height = this.innerHeight - this.headerHeight;
        this.listMaxHeight = height + '';
        this.listMaxWidth = '500px';
        // Scroll active folder when page load, if option set = true
        /*  if ($.MyAdmin.options.leftSideBar.scrollActiveItemWhenPageLoad) {
          var activeItemOffsetTop = $('.menu .list li.active')[0].offsetTop
          if (activeItemOffsetTop > 150) $el.slimscroll({ scrollTo: activeItemOffsetTop + 'px' });
      }*/
    }
    isOpen() {
        return this.bodyTag.classList.contains('overlay-open');
    }
    checkStatusForResize(firstTime) {
        if (window.innerWidth < 1170) {
            this.renderer.addClass(this.document.body, 'ls-closed');
        } else {
            this.renderer.removeClass(this.document.body, 'ls-closed');
        }
    }

    mouseHover(e) {
        const body = this.elementRef.nativeElement.closest('body');

        if (body.classList.contains('submenu-closed')) {
            this.renderer.addClass(this.document.body, 'side-closed-hover');
            this.renderer.removeClass(this.document.body, 'submenu-closed');
        }
    }
    mouseOut(e) {
        const body = this.elementRef.nativeElement.closest('body');

        if (body.classList.contains('side-closed-hover')) {
            this.renderer.removeClass(this.document.body, 'side-closed-hover');
            this.renderer.addClass(this.document.body, 'submenu-closed');
        }
    }
}
