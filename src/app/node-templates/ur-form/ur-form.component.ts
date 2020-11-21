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
    }

    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && data.msg.topic && typeof data.msg.payload !== 'undefined') {
            for (let field of this.data.options) {
                if (data.msg.topic.includes(field.topic)) {
                    this.data.formValue[field.topic] = data.msg.payload;
                    break;
                }
            }
        }
    }

    valueChange(field: string, value: any) {
        this.data.formValue[field] = value;
    }

    submit() {
        for (const field of this.data.options) {
            const payload = this.data.formValue[field.topic]
            if (payload !== '') { // send only if form element has a value
                this.send({ topic: field.outtopic || field.topic, payload });
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
                return parseFloat(value).toFixed(parseInt(precision, 10));
            }
        } catch (e) {}
        return value;
    }
}