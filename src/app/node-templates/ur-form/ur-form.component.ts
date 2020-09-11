import { Component } from '@angular/core';
import { BaseNode } from '../ur-base-node';
import { WebSocketService, SnackbarService } from '../../services';

@Component({
    selector: 'app-ur-form',
    templateUrl: './ur-form.component.html',
    styleUrls: ['./ur-form.component.sass'],
})
export class UrFormComponent extends BaseNode {
    private originalValues = {};

    constructor(protected webSocketService: WebSocketService, private snackbar: SnackbarService,) {
        super(webSocketService);
    }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.originalValues = { ... this.data.formValue };
    }

    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.topic && typeof data.payload !== 'undefined') {
            this.data.formValue[data.topic] = data.payload;
        }
    }

    valueChange(field: string, value: any) {
        this.data.formValue[field] = value;
    }

    submit() {
        for (let topic in this.data.formValue) {
            this.send({ "topic": topic, "payload": this.data.formValue[topic] });
        }
        this.snackbar.success('Saved!');
    }

    reset() {
        this.data.formValue = { ... this.originalValues };
    }
}