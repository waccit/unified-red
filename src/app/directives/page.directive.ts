import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[page-host]',
})
export class PageDirective {
    constructor(public viewContainerRef: ViewContainerRef) {}
}
