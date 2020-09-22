import { Component, OnInit, ComponentFactoryResolver, ViewChild, ViewContainerRef, Renderer2 } from '@angular/core';
import { MenuPageDirective } from '../../directives/menu-page.directive';
import { GroupComponent } from '../group/group.component';
import { pageGroups } from './page-groups';
import { CurrentUserService, RoleService, WebSocketService } from '../../services';
import { WidgetService } from '../../services/widget.service';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { MenuService } from '../../services/menu.service';
import { RouteInfo } from '../../layout/sidebar/sidebar.metadata';
import { User } from '../../data';

@Component({
    selector: 'app-menu-page',
    templateUrl: './menu-page.component.html',
    styleUrls: ['./menu-page.component.sass'],
})
export class MenuPageComponent implements OnInit {
    private menuItem: string;
    private menuItems: string[];
    private pathList: string[];
    private menuPage: string;
    private pageGroupsList: pageGroups[];
    private _menuSubscription: Subscription;
    breadcrumbs: string[];
    @ViewChild(MenuPageDirective, { static: true }) menuPageHost: MenuPageDirective;
    private userRole: string;

    constructor(
        private route: ActivatedRoute,
        private webSocketService: WebSocketService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private widgetService: WidgetService,
        private menuService: MenuService,
        private viewContainerRef: ViewContainerRef,
        private renderer2: Renderer2,
        protected currentUserService: CurrentUserService,
        protected roleService: RoleService,
    ) {}

    ngOnInit(): void {
        this.viewContainerRef = this.menuPageHost.viewContainerRef;

        this.currentUserService.currentUser.subscribe((user: User) => {
            if (user) {
                this.userRole = user.role;

                this.route.url.subscribe((segments: UrlSegment[]) => {
                    // this.breadcrumbs = [...segments.map((seg) => seg.path)];
                    this.menuItems = [...segments.map((seg) => seg.path).slice(0, segments.length - 1)];
                    this.pathList = [...segments.map((seg) => seg.path)];
                    this.menuPage = segments[segments.length - 1].path;
        
                    if (this._menuSubscription !== undefined) {
                        this._menuSubscription.unsubscribe();
                    }
        
                    this._menuSubscription = this.menuService.menu.subscribe((menu: RouteInfo[]) => {
                        this.setPageGroupsList(menu);
                        this.loadGroups();
                    });
                });

            }
        });
    }

    setPageGroupsList(menu: any[]) {
        this.pageGroupsList = [];
        this.breadcrumbs = [];
        let localCopy = [...this.pathList];
        let parent: any = null;

        // console.log('localCopy: ', localCopy);

        while (localCopy.length > 2) {
            let curr = localCopy.shift();

            if (parent) {
                parent = this.findMenuEntityByKeyValue(parent, 'title', curr);
            } else {
                parent = this.findMenuEntityByKeyValue(menu, 'title', curr);
                // this.breadcrumbs.push(parent.title);
            }
            if (parent) {
                this.breadcrumbs.push(parent.title);
            }
        }

        this.menuItem = this.pathList[this.pathList.length - 2];
        this.menuPage = this.pathList[this.pathList.length - 1];

        // console.log('parent: ', parent);
        // console.log('menuItem: ', this.menuItem);
        // console.log('menuPage: ', this.menuPage);

        let foundMenuItem = this.findMenuEntityByKeyValue(parent ? parent : menu, 'title', this.menuItem);

        // console.log('foundMenuItem: ', foundMenuItem);

        let foundMenuPage: any;
        if (foundMenuItem) {
            this.breadcrumbs.push(foundMenuItem.title);
            foundMenuPage = this.findMenuEntityByKeyValue(foundMenuItem.items, 'title', this.menuPage);
        }
        // console.log('foundMenuPage: ', foundMenuPage);

        if (foundMenuPage) {
            this.breadcrumbs.push(foundMenuPage.title);
            foundMenuPage.items.forEach((g) => {
                this.pageGroupsList.push({
                    header: g.header,
                    access: g.access || '',
                    cols: { lg: g.widthLg, md: g.widthMd, sm: g.widthSm },
                    widgets: this.widgetService.getWidgets(g.items),
                });
            });
        }
        // console.log('setPageGroupsList finished, pageGroupsList is: ', this.pageGroupsList);
    }

    // credit: https://stackoverflow.com/questions/15523514/find-by-key-deep-in-a-nested-array
    findMenuEntityByKeyValue(container: any, key: string, value: string) {
        var result = null;
        if (container instanceof Array) {
            for (var i = 0; i < container.length; i++) {
                result = this.findMenuEntityByKeyValue(container[i], key, value);
                if (result) {
                    break;
                }
            }
        } else {
            for (var prop in container) {
                // console.log(prop + ': ' + container[prop]);
                if (prop == key) {
                    if (container[prop].replace(/ /g, '').toLowerCase() == value) {
                        return container;
                    }
                }
                if (container[prop] instanceof Object || container[prop] instanceof Array) {
                    result = this.findMenuEntityByKeyValue(container[prop], key, value);
                    if (result) {
                        break;
                    }
                }
            }
        }
        return result;
    }

    loadGroups() {
        this.viewContainerRef.clear();

        this.pageGroupsList.forEach((group) => {
            let access: any;
            if (!group.access || group.access === '0') {
                access = this.roleService.getRoleAccess('datapoint', this.userRole);
            }
            else {
                access = this.roleService.overrideRoleAccess('datapoint', this.userRole, group.access);
            }
            if (!access.read) {
                return;
            }

            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(GroupComponent);
            const componentRef = this.viewContainerRef.createComponent(componentFactory);

            componentRef.instance.header = group.header;

            for (var size in group.cols) {
                let colClass = 'col-' + size + '-' + group.cols[size];
                this.renderer2.addClass(componentRef.location.nativeElement, colClass);
            }

            componentRef.instance.widgets = group.widgets;
        });
    }
}
