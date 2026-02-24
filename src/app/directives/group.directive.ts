import { Directive, ViewContainerRef } from '@angular/core';

@Directive({

    standalone: false,

    selector: '[group-host]',
})
export class GroupDirective {
    constructor(public viewContainerRef: ViewContainerRef) {}
}
