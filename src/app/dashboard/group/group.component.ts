import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    ComponentFactoryResolver,
    ViewContainerRef,
    Renderer2,
} from '@angular/core';
import { Tab } from '../../data/tab.model';
import { GroupDirective } from '../../directives/group.directive';
import { TabComponent } from '../tab/tab.component';

@Component({
    selector: 'app-group',
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.sass'],
})
export class GroupComponent implements OnInit, OnDestroy {
    header: string;
    cols: string;
    tabs: Tab[];
    displayHeader: boolean;
    @ViewChild(GroupDirective, { static: true }) groupHost: GroupDirective;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private viewContainerRef: ViewContainerRef,
        private renderer2: Renderer2
    ) {}

    ngOnInit() {
        this.viewContainerRef = this.groupHost.viewContainerRef;
        // this.loadTabs();
        if (this.tabs && this.tabs.length < 2) {
            this.loadTab();
        }
    }

    ngOnDestroy(): void {
        this.viewContainerRef.clear();
    }

    loadTab() {
        this.viewContainerRef.clear();

        if (this.tabs[0].widgets) {
            this.tabs[0].widgets.forEach((widget) => {
                const componentFactory = this.componentFactoryResolver.resolveComponentFactory(widget.component);

                const componentRef = this.viewContainerRef.createComponent(componentFactory);
                componentRef.instance.data = widget.data;
                const colWidth = +widget.data.width || 12;
                const colClass = 'col-' + colWidth;
                this.renderer2.addClass(componentRef.location.nativeElement, colClass);
            });
        }
    }

    // loadTabs() {
    //     this.viewContainerRef.clear();

    //     if (this.tabs) {
    //         this.tabs.forEach((tab) => {
    //             const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TabComponent);

    //             const componentRef = this.viewContainerRef.createComponent(componentFactory);
    //             componentRef.instance.header = tab.header;
    //             componentRef.instance.widgets = tab.widgets;
    //         });
    //     }
    // }

    // loadWidgets() {
    //     this.viewContainerRef.clear();

    //     if (this.widgets) {
    //         this.widgets.forEach((widget) => {
    //             const componentFactory = this.componentFactoryResolver.resolveComponentFactory(widget.component);

    //             const componentRef = this.viewContainerRef.createComponent(componentFactory);
    //             componentRef.instance.data = widget.data;
    //             const colWidth = widget.data.width !== 0 ? widget.data.width : 12;
    //             const colClass = 'col-' + colWidth;
    //             this.renderer2.addClass(componentRef.location.nativeElement, colClass);
    //         });
    //     }
    // }
}
