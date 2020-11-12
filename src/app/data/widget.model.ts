import { Type } from '@angular/core';

export class Widget {
    constructor(public component: Type<any>, public data: any) {}
}
