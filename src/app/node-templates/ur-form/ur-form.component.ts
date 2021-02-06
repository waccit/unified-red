import { Component, AfterViewInit } from '@angular/core';
import { BaseNode } from '../ur-base-node';
import { WebSocketService, SnackbarService, CurrentUserService, RoleService } from '../../services';

@Component({
    selector: 'app-ur-form',
    templateUrl: './ur-form.component.html',
    styleUrls: ['./ur-form.component.sass'],
})
export class UrFormComponent extends BaseNode implements AfterViewInit {
    private originalValues = {};

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.setupDatapointAccess();
        this.originalValues = { ... this.data.formValue };
        for (let field of this.data.options) {
            field.topic = this.evalVariables(field.topic);
        }
    }

    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && data.msg.topic && typeof data.msg.payload !== 'undefined') {
            for (let field of this.data.options) {
                if (data.msg.topic.includes(field.topic)) {
                    field.intopic = data.msg.topic;
                    if (!field.options?.units && data.msg.payload.units) {
                        let options = field.options || {};
                        options.units = data.msg.payload.units;
                        field.options = options;
                    }
                    this.data.formValue[field.topic] = this.formatFromData(data);
                    break;
                }
            }
        }
    }

    valueChange(field: string, value: any, fieldType: string) {
        if (fieldType === "number" && !isNaN(value)) {
            value = parseFloat(value);
        }
        this.data.formValue[field] = value;
    }

    submit() {
        if (this.data.singleMsg === "true") {
            let combinedPayload = {};
            for (const field of this.data.options) {
                combinedPayload[field.outtopic] = this.data.formValue[field.topic];
            }
            this.formatAndSend(this.data.singleMsgTopic, combinedPayload);
            this.snackbar.success('Saved!');
        }
        else {
            for (const field of this.data.options) {
                const payload = this.data.formValue[field.topic];
                if (payload !== '') { // send only if form element has a value
                    let topic = field.outtopic || field.intopic || field.topic;
                    this.formatAndSend(topic, payload);
                }
            }
            this.snackbar.success('Saved!');
        }
    }

    reset() {
        this.data.formValue = { ... this.originalValues };
    }

    precision(value, precision) {
        try {
            if (value && !isNaN(value) && precision && !isNaN(precision)) {
                return parseFloat(value).toFixed(parseInt(precision, 10));
            }
        } catch (e) {}
        return value;
    }
}