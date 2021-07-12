import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[group-host]',
})
export class GroupDirective {
    constructor(public viewContainerRef: ViewContainerRef) {}
}
