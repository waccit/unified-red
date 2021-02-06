import { AfterViewInit, Component } from '@angular/core';
import { BaseNode } from '../ur-base-node';

@Component({
    selector: 'app-ur-text',
    templateUrl: './ur-text.component.html',
    styleUrls: ['./ur-text.component.sass'],
})
export class UrTextComponent extends BaseNode implements AfterViewInit {
    label: string;
    text: any;

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.setupDatapointAccess();
        this.label = this.data.label.includes('{{') ? '' : this.data.label;
    }

    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && typeof data.msg.payload !== 'undefined') {
            this.label = this.formatFromData(data, this.data.label);
            this.text = this.formatFromData(data);
            if (data.msg.payload.units) {
                this.text += ' ' + data.msg.payload.units;
            }
        }
    }
}
