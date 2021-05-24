import { Component, OnInit, ComponentFactoryResolver, ViewChild, ViewContainerRef, Renderer2 } from '@angular/core';
import { PageDirective } from '../../directives/page.directive';
import { GroupComponent } from '../group/group.component';
import { Group } from '../../data/group.model';
import { CurrentUserService, RoleService } from '../../services';
import { WidgetService } from '../../services/widget.service';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { Subscription } from 'rxjs';
import { MenuService } from '../../services/menu.service';
import { RouteInfo } from '../../layout/sidebar/sidebar.metadata';
import { User } from '../../data';

@Component({
    selector: 'app-page',
    templateUrl: './page.component.html',
    styleUrls: ['./page.component.sass'],
})
export class PageComponent implements OnInit {
    private pathList: string[];
    private folder: string;
    private page: string;
    private groups: Group[];
    private _menuSubscription: Subscription;
    breadcrumbs: string[];
    @ViewChild(PageDirective, { static: true }) pageHost: PageDirective;
    private userRole: string;

    constructor(
        private route: ActivatedRoute,
        private componentFactoryResolver: ComponentFactoryResolver,
        private widgetService: WidgetService,
        private menuService: MenuService,
        private viewContainerRef: ViewContainerRef,
        private renderer2: Renderer2,
        protected currentUserService: CurrentUserService,
        protected roleService: RoleService
    ) {}

    ngOnInit(): void {
        this.viewContainerRef = this.pageHost.viewContainerRef;

        this.currentUserService.currentUser.subscribe((user: User) => {
            if (user) {
                this.userRole = user.role;

                this.route.url.subscribe((segments: UrlSegment[]) => {
                    this.pathList = [...segments.map((seg) => seg.path)];

                    if (this._menuSubscription !== undefined) {
                        this._menuSubscription.unsubscribe();
                    }

                    this._menuSubscription = this.menuService.menu.subscribe((menu: RouteInfo[]) => {
                        this.setGroups(menu);
                        this.loadGroups();
                    });
                });
            }
        });
    }

    setGroups(menu: any[]) {
        this.groups = [];
        this.breadcrumbs = [];
        const localCopy = [...this.pathList];
        let parent: any = null;

        while (localCopy.length > 2) {
            const curr = localCopy.shift();

            parent = this.findMenuEntityByKeyValue(parent ? parent.items : menu, 'title', curr);

            if (parent) {
                this.breadcrumbs.push(parent.title);
            }
        }

        this.folder = this.pathList[this.pathList.length - 2];
        this.page = this.pathList[this.pathList.length - 1];

        const foundFolder = this.findMenuEntityByKeyValue(parent ? parent.items : menu, 'title', this.folder);

        // do not render disabled folders
        if (foundFolder && foundFolder.disabled) {
            // this.router.navigate(['/d/disabled']);
            this.breadcrumbs.push('DISABLED');
            return;
        }

        let foundPage: any;
        if (foundFolder) {
            this.breadcrumbs.push(foundFolder.title);
            foundPage = this.findMenuEntityByKeyValue(foundFolder.items, 'title', this.page);
        }

        if (foundPage) {
            // do not render disabled pages
            if (foundPage.disabled) {
                this.breadcrumbs.push('DISABLED');
                return;
            }
            this.breadcrumbs.push(foundPage.title);
            foundPage.items.forEach((g) => {
                this.groups.push({
                    header: g.header,
                    access: g.access || '',
                    cols: { lg: g.widthLg, md: g.widthMd, sm: g.widthSm },
                    tabs: g.items.map((t) => {
                        return {
                            header: t.header,
                            widgets: this.widgetService.getWidgets(t.items),
                        };
                    }),
                    displayHeader: !!g.disp,
                });
            });
        }
    }

    // credit: https://stackoverflow.com/questions/15523514/find-by-key-deep-in-a-nested-array
    findMenuEntityByKeyValue(container: any, key: string, value: string) {
        let result = null;
        if (container instanceof Array) {
            for (const entity of container) {
                result = this.findMenuEntityByKeyValue(entity, key, value);
                if (result) {
                    break;
                }
            }
        } else {
            for (const prop in container) {
                if (prop === key) {
                    if (container[prop].replace(/ /g, '').toLowerCase() === value) {
                        return container;
                    }
                }
            }

            for (const prop in container) {
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

        this.groups.forEach((group) => {
            let access: any;
            if (!group.access || group.access === '0') {
                access = this.roleService.getRoleAccess('datapoint', this.userRole);
            } else {
                access = this.roleService.overrideRoleAccess('datapoint', this.userRole, group.access);
            }
            if (!access.read) {
                return;
            }

            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(GroupComponent);
            const componentRef = this.viewContainerRef.createComponent(componentFactory);

            componentRef.instance.header = group.header;
            componentRef.instance.displayHeader = group.displayHeader;

            for (const size in group.cols) {
                if (size) {
                    const colClass = 'col-' + size + '-' + group.cols[size];
                    this.renderer2.addClass(componentRef.location.nativeElement, colClass);
                }
            }

            componentRef.instance.tabs = group.tabs;
        });
    }
}
