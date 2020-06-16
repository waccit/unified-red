import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[menu-page-host]',
})
export class MenuPageDirective {
    constructor(public viewContainerRef: ViewContainerRef) {}
}
