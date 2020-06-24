import { Component, OnInit, OnDestroy, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { MenuPageDirective } from '../../directives/menu-page.directive';
import { GroupComponent } from '../group/group.component';
import { pageGroups } from './page-groups';
import { WebSocketService } from '../../services';
import { WidgetService } from '../../services/widget.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-menu-page',
    templateUrl: './menu-page.component.html',
    styleUrls: ['./menu-page.component.sass'],
})
export class MenuPageComponent implements OnInit, OnDestroy {
    menuItem: string;
    menuPage: string;
    pageGroupsList: pageGroups[];
    @ViewChild(MenuPageDirective, { static: true }) menuPageHost: MenuPageDirective;

    constructor(
        private route: ActivatedRoute,
        private webSocketService: WebSocketService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private widgetService: WidgetService,
        private viewContainerRef: ViewContainerRef
    ) {}

    ngOnInit(): void {
        this.viewContainerRef = this.menuPageHost.viewContainerRef;

        this.route.params.subscribe((params) => {
            this.menuItem = params['menuItem'];
            this.menuPage = params['menuPage'];

            this.webSocketService.emit('ui-refresh', null);

            this.webSocketService.listen('ui-controls').subscribe((data: any) => {
                this.setPageGroupsList(data.menu);
                // console.log('MenuPageComponent data.menu: ', data.menu);
                // console.log('MenuPageComponent pageGroupsList: ', this.pageGroupsList);
                this.loadGroups();
            });

            // console.log('menu-page.component :menuItem/:menuPage: ', this.menuItem + '/' + this.menuPage);
        });
    }

    ngOnDestroy(): void {}

    setPageGroupsList(menu: any[]) {
        this.pageGroupsList = [];

        let foundMenuItem = this.findMenuEntityByKeyValue(menu, 'title', this.menuItem);
        let foundMenuPage: any;

        if (foundMenuItem) {
            foundMenuPage = this.findMenuEntityByKeyValue(foundMenuItem.items, 'title', this.menuPage);
        }

        if (foundMenuPage) {
            foundMenuPage.items.forEach((g) => {
                this.pageGroupsList.push({
                    header: g.header,
                    widgets: this.widgetService.getWidgets(g.items),
                });
            });
        }

        // console.log('menu-page.comp foundMenuItem: ', foundMenuItem);
        // console.log('menu-page.comp foundMenuPage: ', foundMenuPage);
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
                    if (container[prop].replace(' ', '').toLowerCase() == value) {
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
            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(GroupComponent);

            const componentRef = this.viewContainerRef.createComponent(componentFactory);
            componentRef.instance.header = group.header;
            componentRef.instance.widgets = group.widgets;
        });
    }
}
