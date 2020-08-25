import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-ur-button',
    templateUrl: './ur-button.component.html',
    styleUrls: ['./ur-button.component.sass'],
})
export class UrButtonComponent implements OnInit {
    label: string = 'default';
    data: any;

    constructor() {}

    ngOnInit(): void {
        this.label = this.data.label;
    }
}
