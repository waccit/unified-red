import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-ur-text-input',
    templateUrl: './ur-text-input.component.html',
    styleUrls: ['./ur-text-input.component.sass'],
})
export class UrTextInputComponent implements OnInit {
    text: string;
    data: any;

    constructor() {}

    ngOnInit(): void {
        this.text = this.data.label ? this.data.label : 'Enter Text';
        // TODO: add WebSocketService Listener
        // TODO: add WebSocketService Emitter
    }
}
