import { Directive, ViewContainerRef } from '@angular/core';

@Directive({

    standalone: false,

    selector: '[page-host]',
})
export class PageDirective {
    constructor(public viewContainerRef: ViewContainerRef) {}
}
