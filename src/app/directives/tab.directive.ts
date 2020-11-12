import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[tab-host]',
})
export class TabDirective {
    constructor(public viewContainerRef: ViewContainerRef) {}
}
