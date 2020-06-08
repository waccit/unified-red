import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-ur-button',
    templateUrl: './ur-button.component.html',
    styleUrls: ['./ur-button.component.sass'],
})
export class UrButtonComponent implements OnInit {
    @Input() text: string = 'defualt';

    constructor() {}

    ngOnInit(): void {}
}
