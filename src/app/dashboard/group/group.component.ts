import {
    Component,
    OnInit,
    OnDestroy,
    Input,
    ViewChild,
    ComponentFactoryResolver,
    ViewContainerRef,
} from '@angular/core';
import { GroupDirective } from '../../directives/group.directive';
import { groupWidgets } from './group-widget';

@Component({
    selector: 'app-group',
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.sass'],
})
export class GroupComponent implements OnInit, OnDestroy {
    @Input() header: string;
    @Input() widgets: groupWidgets[];
    @ViewChild(GroupDirective, { static: true }) groupHost: GroupDirective;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private viewContainerRef: ViewContainerRef
    ) {}

    ngOnInit() {
        this.viewContainerRef = this.groupHost.viewContainerRef;
        this.loadWidgets();
    }

    ngOnDestroy(): void {
        this.viewContainerRef.clear();
    }

    loadWidgets() {
        this.viewContainerRef.clear();

        if (this.widgets) {
            this.widgets.forEach((widget) => {
                const componentFactory = this.componentFactoryResolver.resolveComponentFactory(widget.component);

                const componentRef = this.viewContainerRef.createComponent(componentFactory);
                componentRef.instance.data = widget.data;
                componentRef.instance.text = widget.text;
            });
        }
    }
}
