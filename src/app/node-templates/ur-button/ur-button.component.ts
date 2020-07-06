import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-ur-button',
    templateUrl: './ur-button.component.html',
    styleUrls: ['./ur-button.component.sass'],
})
export class UrButtonComponent implements OnInit {
    text: string = 'defualt';
    data: any;

    constructor() {}

    ngOnInit(): void {
        this.text = this.data.label;
    }
}
