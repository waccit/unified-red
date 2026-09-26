import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { PageDirective } from '../../directives/page.directive';
import { GroupComponent } from '../group/group.component';
import { Group } from '../../data/group.model';
import { CurrentUserService, RoleService } from '../../services';
import { WidgetService } from '../../services/widget.service';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MenuService } from '../../services/menu.service';
import { RouteInfo } from '../../layout/sidebar/sidebar.metadata';
import { User } from '../../data';

@Component({

    standalone: false,

    selector: 'app-page',
    templateUrl: './page.component.html',
    styleUrls: ['./page.component.sass'],
})
export class PageComponent implements OnInit, OnDestroy {
    private pathList: string[];
    private folder: string;
    private page: string;
    private groups: Group[];
    private _menuSubscription: Subscription;
    private _userSubscription: Subscription;
    private _urlSubscription: Subscription;
    private _lastMenu: RouteInfo[];
    private _notFoundTimer: any = null;

    /**
     * How long the menu must be QUIET, with the page still missing, before it is
     * treated as a real 404.
     *
     * A deploy removes the node's menu entry and rebuilds it a moment later, and
     * ui.js prunes a page once its last node is gone (cleanupChildlessFolders), so
     * a page whose only widget is the node being redeployed disappears from the
     * menu for the duration of the deploy. That duration is not a constant: a
     * holidays change restarts every schedule node, which measured ~2.9s for 113
     * nodes on a dev machine and is unbounded on slower hardware.
     *
     * So this is a debounce, not a deadline: every menu update that still lacks the
     * page restarts the countdown, and the page reappearing cancels it. The timer
     * therefore only expires once the backend has stopped sending menu updates
     * altogether, which makes it independent of how long the deploy took.
     */
    private static readonly NOT_FOUND_GRACE_MS = 10000;
    breadcrumbs: string[];
    @ViewChild(PageDirective, { static: true }) pageHost: PageDirective;
    private userRole: string;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private widgetService: WidgetService,
        private menuService: MenuService,
        private viewContainerRef: ViewContainerRef,
        private renderer2: Renderer2,
        protected currentUserService: CurrentUserService,
        protected roleService: RoleService
    ) { }

    ngOnInit(): void {
        this.viewContainerRef = this.pageHost.viewContainerRef;

        this._userSubscription = this.currentUserService.currentUser.subscribe((user: User) => {
            this.userRole = user ? user.role : undefined;
            if (user && this._lastMenu?.length) {
                this.setGroups(this._lastMenu);
                this.loadGroups();
            }
        });

        this._urlSubscription = this.route.url.subscribe((segments: UrlSegment[]) => {
            this.pathList = [...segments.map((seg) => seg.path)];
            // resolving a different URL; any pending 404 refers to the old one
            this.cancelNotFound();

            if (this._menuSubscription !== undefined) {
                this._menuSubscription.unsubscribe();
            }

            this._menuSubscription = this.menuService.menu
                .pipe(debounceTime(300))
                .subscribe((menu: RouteInfo[]) => {
                    if (menu && menu.length) {
                        this._lastMenu = menu;
                        this.setGroups(menu);
                        this.loadGroups();
                    }
                });
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
        let foundPage: any;

        const foundFolder = this.findMenuEntityByKeyValue(parent ? parent.items : menu, 'title', this.folder);

        // do not render disabled folders
        if (
            foundFolder &&
            (foundFolder.disabled || (foundFolder.accessBehavior === 'disable' && !this.hasAccess(foundFolder.access)))
        ) {
            // this.router.navigate(['/d/disabled']);
            this.cancelNotFound();
            this.breadcrumbs.push('DISABLED');
            return;
        }

        if (foundFolder) {
            this.breadcrumbs.push(foundFolder.title);
            foundPage = this.findMenuEntityByKeyValue(foundFolder.items, 'title', this.page);
        } else {
            this.scheduleNotFound();
        }

        if (foundPage) {
            this.cancelNotFound();
            // do not render disabled pages
            if (foundPage.disabled) {
                this.breadcrumbs.push('DISABLED');
                return;
            }
            this.breadcrumbs.push(foundPage.title);
            foundPage.items.forEach((g) => {
                // do not render hidden groups
                if (g.accessBehavior === 'hide' ? this.hasAccess(g.access) && !g.hidden : !g.hidden) {
                    this.groups.push({
                        header: g.header,
                        cols: { lg: g.widthLg, md: g.widthMd, sm: g.widthSm },
                        tabs: g.items.map((t) => {
                            return {
                                header: t.header,
                                disabled: t.disabled,
                                hidden: t.hidden,
                                widgets: this.widgetService.getWidgets(t.items),
                                access: t.access,
                                accessBehavior: t.accessBehavior,
                            };
                        }),
                        displayHeader: !!g.disp,
                        disabled: !!g.disabled,
                        access: g.access,
                        accessBehavior: g.accessBehavior,
                    });
                }
            });
        } else {
            this.scheduleNotFound();
        }
    }

    /** Defer the 404 so a menu that is mid-rebuild does not navigate the user away. */
    private scheduleNotFound(): void {
        // Restart, never coalesce: each menu update that still lacks the page has
        // to push the deadline out, otherwise a long deploy would expire the timer
        // that was armed at the start of it.
        this.cancelNotFound();
        this._notFoundTimer = setTimeout(() => {
            this._notFoundTimer = null;
            this.router.navigateByUrl('404');
        }, PageComponent.NOT_FOUND_GRACE_MS);
    }

    private cancelNotFound(): void {
        if (this._notFoundTimer) {
            clearTimeout(this._notFoundTimer);
            this._notFoundTimer = null;
        }
    }

    ngOnDestroy(): void {
        // a pending 404 must not fire after the user has navigated elsewhere
        this.cancelNotFound();
        this._menuSubscription?.unsubscribe();
        this._userSubscription?.unsubscribe();
        this._urlSubscription?.unsubscribe();
    }

    hasAccess(access) {
        if (!access) access = 0;
        if (this.userRole == null || this.userRole === undefined) {
            return access === 0;
        }
        return this.userRole >= access;
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
            // let access: any;
            // if (!group.access || group.access === '0') {
            //     access = this.roleService.getRoleAccess('datapoint', this.userRole);
            // } else {
            //     access = this.roleService.overrideRoleAccess('datapoint', this.userRole, group.access);
            // }
            // if (!access.read) {
            //     return;
            // }

            const componentRef = this.viewContainerRef.createComponent(GroupComponent);

            componentRef.instance.header = group.header;
            componentRef.instance.displayHeader = group.displayHeader;
            componentRef.instance.disabled =
                group.disabled || (group.accessBehavior === 'disable' && !this.hasAccess(group.access)) ? true : false;

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
