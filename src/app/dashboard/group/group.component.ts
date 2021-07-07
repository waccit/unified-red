import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    ComponentFactoryResolver,
    ViewContainerRef,
    Renderer2,
} from '@angular/core';
import { User } from '../../data';
import { Tab } from '../../data/tab.model';
import { GroupDirective } from '../../directives/group.directive';
import { CurrentUserService } from '../../services';
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
    disabled: boolean;
    @ViewChild(GroupDirective, { static: true }) groupHost: GroupDirective;
    private userRole;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private viewContainerRef: ViewContainerRef,
        private renderer2: Renderer2,
        private currentUserService: CurrentUserService
    ) {}

    ngOnInit() {
        this.viewContainerRef = this.groupHost.viewContainerRef;

        this.currentUserService.currentUser.subscribe((user: User) => {
            if (user) {
                this.userRole = user.role;
            }
        });

        // do not render hidden tabs
        this.tabs = this.tabs.filter((tab) =>
            tab.accessBehavior === 'hide' ? this.hasAccess(tab.access) && !tab.hidden : !tab.hidden
        );

        // update disabled access
        this.tabs.forEach((tab) => {
            tab.disabled =
                tab.disabled || (tab.accessBehavior === 'disable' && !this.hasAccess(tab.access)) ? true : false;
        });

        // this.loadTabs(); => this is being handled in html
        if (this.tabs && this.tabs.length < 2) {
            this.loadTab();
        }
    }

    ngOnDestroy(): void {
        this.viewContainerRef.clear();
    }

    hasAccess(access): boolean {
        if (!access) access = 0;

        return this.userRole >= access;
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
}
