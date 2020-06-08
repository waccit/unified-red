import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[group-host]',
})
export class DashboardDirective {
    constructor(public viewContainerRef: ViewContainerRef) {}
}
