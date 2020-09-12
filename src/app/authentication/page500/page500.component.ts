import { Component, OnInit } from '@angular/core';

declare const $: any;

@Component({
    selector: 'app-page500',
    templateUrl: './page500.component.html',
    styleUrls: ['./page500.component.scss'],
})
export class Page500Component implements OnInit {
    constructor() {}

    ngOnInit() {
        const loginformcenter =
            ($(window).height() - $('.login100-form').height()) / 2 - 34;
        $('.login100-form').css('margin-top', loginformcenter);
    }
}
