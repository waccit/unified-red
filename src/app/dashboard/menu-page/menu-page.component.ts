import {
    Component,
    OnInit,
    OnDestroy,
    ComponentFactoryResolver,
    ViewChild,
    Input,
    ViewContainerRef,
} from '@angular/core';
import { MenuPageDirective } from '../../directives/menu-page.directive';
import { GroupComponent } from '../group/group.component';
import { pageGroups } from './page-groups';
import { WebSocketService } from '../../services';
import { WidgetService } from '../../services/widget.service';

@Component({
    selector: 'app-menu-page',
    templateUrl: './menu-page.component.html',
    styleUrls: ['./menu-page.component.sass'],
})
export class MenuPageComponent implements OnInit, OnDestroy {
    pageGroupsList: pageGroups[];
    @ViewChild(MenuPageDirective, { static: true }) menuPageHost: MenuPageDirective;

    constructor(
        private webSocketService: WebSocketService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private widgetService: WidgetService,
        private viewContainerRef: ViewContainerRef
    ) {
        this.webSocketService.listen('ui-controls').subscribe((data: any) => {
            this.setPageGroupsList(data.menu);
            console.log('MenuPageComponent pageGroupsList: ', this.pageGroupsList);
            this.loadGroups();
        });
        console.log('MenuPageComponent Constructed');
    }

    ngOnInit(): void {
        this.viewContainerRef = this.menuPageHost.viewContainerRef;
    }

    ngOnDestroy(): void {}

    setPageGroupsList(menu: any[]) {
        this.pageGroupsList = [];
        // menu-item
        menu.forEach((mi) => {
            // menu-page
            mi.items.forEach((mp) => {
                // group
                mp.items.forEach((g) => {
                    this.pageGroupsList.push({
                        header: g.header,
                        widgets: this.widgetService.getWidgets(g.items),
                    });
                });
            });
        });
    }

    loadGroups() {
        // const viewContainerRef = this.menuPageHost.viewContainerRef;
        this.viewContainerRef.clear();

        this.pageGroupsList.forEach((group) => {
            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(GroupComponent);

            const componentRef = this.viewContainerRef.createComponent(componentFactory);
            componentRef.instance.header = group.header;
            componentRef.instance.widgets = group.widgets;
        });
    }
}
