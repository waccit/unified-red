import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-ur-text-input',
    templateUrl: './ur-text-input.component.html',
    styleUrls: ['./ur-text-input.component.sass'],
})
export class UrTextInputComponent implements OnInit {
    @Input() text: string;

    constructor() {}

    ngOnInit(): void {
        // TODO: add WebSocketService Listener
        // TODO: add WebSocketService Emitter
    }
}
