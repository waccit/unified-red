import { Component, OnInit } from '@angular/core';

declare const $: any;

@Component({
    selector: 'app-page404',
    templateUrl: './page404.component.html',
    styleUrls: ['./page404.component.scss'],
})
export class Page404Component implements OnInit {
    constructor() {}

    ngOnInit() {
        const loginformcenter =
            ($(window).height() - $('.login100-form').height()) / 2 - 34;
        $('.login100-form').css('margin-top', loginformcenter);
    }
}
