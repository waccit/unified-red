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
    menuPageTitle: string;
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
            this.menuPageTitle = params['pageTitle'];

            this.webSocketService.emit('ui-refresh', null);

            this.webSocketService.listen('ui-controls').subscribe((data: any) => {
                this.setPageGroupsList(data.menu);
                console.log('MenuPageComponent pageGroupsList: ', this.pageGroupsList);
                this.loadGroups();
            });
        });

        console.log('menu-page.component pageTitle: ', this.menuPageTitle);
    }

    ngOnDestroy(): void {}

    setPageGroupsList(menu: any[]) {
        this.pageGroupsList = [];

        let foundMenuPage = this.getObject(menu, this.menuPageTitle);

        foundMenuPage.items.forEach((g) => {
            this.pageGroupsList.push({
                header: g.header,
                widgets: this.widgetService.getWidgets(g.items),
            });
        });
    }

    // credit: https://stackoverflow.com/questions/15523514/find-by-key-deep-in-a-nested-array
    getObject(theObject: any, value: string) {
        var result = null;
        if (theObject instanceof Array) {
            for (var i = 0; i < theObject.length; i++) {
                result = this.getObject(theObject[i], value);
                if (result) {
                    break;
                }
            }
        } else {
            for (var prop in theObject) {
                // console.log(prop + ': ' + theObject[prop]);
                if (prop == 'header') {
                    if (theObject[prop].replace(' ', '_') == value) {
                        return theObject;
                    }
                }
                if (theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
                    result = this.getObject(theObject[prop], value);
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
