import {
    Component,
    ComponentFactoryResolver,
    Input,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Widget } from '../../data/widget.model';
import { TabDirective } from '../../directives/tab.directive';

@Component({
    selector: 'app-tab',
    templateUrl: './tab.component.html',
    styleUrls: ['./tab.component.sass'],
})
export class TabComponent implements OnInit, OnDestroy {
    header: string;
    @Input() widgets: Widget[];
    @ViewChild(TabDirective, { static: true }) tabHost: TabDirective;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private viewContainerRef: ViewContainerRef,
        private renderer2: Renderer2
    ) {}

    ngOnInit() {
        this.viewContainerRef = this.tabHost.viewContainerRef;
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
                const colWidth = +widget.data.width || 12;
                const colClass = 'col-' + colWidth;

                this.renderer2.addClass(componentRef.location.nativeElement, colClass);
            });
        }
    }
}
