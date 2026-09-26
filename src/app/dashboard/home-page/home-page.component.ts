import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../data';
import { RouteInfo } from '../../layout/sidebar/sidebar.metadata';
import { CurrentUserService } from '../../services';
import { MenuService } from '../../services/menu.service';
import { Subscription } from 'rxjs';

@Component({

    standalone: false,

    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.sass'],
})
export class HomePageComponent implements OnInit, OnDestroy {
    private subscriptions = new Subscription();
    constructor(
        private router: Router,
        private currentUserService: CurrentUserService,
        private menuService: MenuService
    ) {}

    ngOnInit(): void {
        // Both subscriptions are torn down in ngOnDestroy. Without that they
        // outlive the component, and because the menu is re-emitted on every
        // deploy a stale instance would keep navigating the user back to the
        // first page in the menu long after they had left the home page.
        this.subscriptions.add(
            this.currentUserService.currentUser.subscribe((user: User) => {
            if (user) {
                if (user.homepage) {
                    this.router.navigate([user.homepage]);
                } else {
                    this.subscriptions.add(
                        this.menuService.menu.subscribe((menu: RouteInfo[]) => {
                        if (menu.length) {
                            let item = menu[0];
                            while (item && !item.isPage) {
                                if (!item || !item.submenu || !item.submenu.length) {
                                    break;
                                }
                                item = item.submenu[0];
                            }
                            if (item.isPage) {
                                this.router.navigate([item.path]);
                            }
                        }
                        })
                    );
                }
            }
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}
