import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../data';
import { RouteInfo } from '../../layout/sidebar/sidebar.metadata';
import { CurrentUserService } from '../../services';
import { MenuService } from '../../services/menu.service';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.sass'],
})
export class HomePageComponent implements OnInit {
    constructor(
        private router: Router,
        private currentUserService: CurrentUserService,
        private menuService: MenuService
    ) {}

    ngOnInit(): void {
        this.currentUserService.currentUser.subscribe((user: User) => {
            if (user) {
                if (user.homepage) {
                    this.router.navigate([user.homepage]);
                } else {
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
                    });
                }
            }
        });
    }
}
