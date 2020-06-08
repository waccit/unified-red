import { Component, OnInit, OnDestroy, Input, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { DashboardDirective } from '../../directives/dashboard.directive';
import { groupWidget } from './group-widget';

@Component({
    selector: 'app-group',
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.sass'],
})
export class GroupComponent implements OnInit, OnDestroy {
    @Input() widgets: groupWidget[];
    @ViewChild(DashboardDirective, { static: true }) groupHost: DashboardDirective;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

    ngOnInit() {
        this.loadComponents();
    }

    ngOnDestroy(): void {}

    loadComponents() {
        const viewContainerRef = this.groupHost.viewContainerRef;

        this.widgets.forEach((widget) => {
            const componentFactory = this.componentFactoryResolver.resolveComponentFactory(widget.component);

            const componentRef = viewContainerRef.createComponent(componentFactory);
            componentRef.instance.text = widget.text;
        });
    }
}
