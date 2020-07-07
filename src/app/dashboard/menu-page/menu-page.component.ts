import { Component, OnInit, ComponentFactoryResolver, ViewChild, ViewContainerRef, Renderer2 } from '@angular/core';
import { MenuPageDirective } from '../../directives/menu-page.directive';
import { GroupComponent } from '../group/group.component';
import { pageGroups } from './page-groups';
import { WebSocketService } from '../../services';
import { WidgetService } from '../../services/widget.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-menu-page',
    templateUrl: './menu-page.component.html',
    styleUrls: ['./menu-page.component.sass'],
})
export class MenuPageComponent implements OnInit {
    private menuItem: string;
    private menuPage: string;
    private pageGroupsList: pageGroups[];
    private _wsSubscription: Subscription;
    @ViewChild(MenuPageDirective, { static: true }) menuPageHost: MenuPageDirective;

    constructor(
        private route: ActivatedRoute,
        private webSocketService: WebSocketService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private widgetService: WidgetService,
        private viewContainerRef: ViewContainerRef,
        private renderer2: Renderer2
    ) {}

    ngOnInit(): void {
        this.viewContainerRef = this.menuPageHost.viewContainerRef;

        this.route.params.subscribe((params) => {
            this.menuItem = params['menuItem'];
            this.menuPage = params['menuPage'];

            this.webSocketService.emit('ui-refresh', null);

            if (this._wsSubscription !== undefined) {
                this._wsSubscription.unsubscribe();
            }

            this._wsSubscription = this.webSocketService.listen('ui-controls').subscribe((data: any) => {
                this.setPageGroupsList(data.menu);
                this.loadGroups();
            });

            // console.log('menu-page.component :menuItem/:menuPage: ', this.menuItem + '/' + this.menuPage);
        });
    }

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
                    cols: { lg: g.widthLg, md: g.widthMd, sm: g.widthSm },
                    widgets: this.widgetService.getWidgets(g.items),
                });
            });
        }
        console.log('setPageGroupsList Called');
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

            for (var size in group.cols) {
                let colClass = 'col-' + size + '-' + group.cols[size];
                this.renderer2.addClass(componentRef.location.nativeElement, colClass);
            }

            componentRef.instance.widgets = group.widgets;
        });
    }
}
