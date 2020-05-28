import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-ur-text',
    templateUrl: './ur-text.component.html',
    styleUrls: ['./ur-text.component.sass'],
})
export class UrTextComponent implements OnInit {
    @Input() text: string;

    constructor() {}

    ngOnInit(): void {}
}
