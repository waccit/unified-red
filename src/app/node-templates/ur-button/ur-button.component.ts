import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-ur-button',
    templateUrl: './ur-button.component.html',
    styleUrls: ['./ur-button.component.sass'],
    host: { 'class': 'col-lg-4 col-md-4 col-sm-6 col-xs-12' },
})
export class UrButtonComponent implements OnInit {
    @Input() text: string = 'defualt';

    constructor() {}

    ngOnInit(): void {}
}
