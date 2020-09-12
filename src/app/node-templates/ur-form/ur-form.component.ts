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
        console.log(this.data);
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
        for (let elem of this.data.options) {
            let payload = this.data.formValue[elem.topic]
            if (payload !== "") { // send only if form element has a value
                this.send({ "topic": elem.outtopic || elem.topic, "payload": payload });
            }
        }
        this.snackbar.success('Saved!');
    }

    reset() {
        this.data.formValue = { ... this.originalValues };
    }

    precision(value, precision) {
        try {
            if (value && !isNaN(value) && precision && !isNaN(precision)) {
                return parseFloat(value).toFixed(parseInt(precision));
            }
        } catch (e) {}
        return value;
    }
}