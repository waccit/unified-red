import { AfterViewInit, Component } from '@angular/core';
import { BaseNode } from '../ur-base-node';

@Component({
    selector: 'app-ur-button',
    templateUrl: './ur-button.component.html',
    styleUrls: ['./ur-button.component.sass'],
})
export class UrButtonComponent extends BaseNode implements AfterViewInit {
    label: string;

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.setupDatapointAccess();
        this.label = this.data.label.includes('{{') ? '' : this.data.label;
    }

    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && typeof data.msg.payload !== 'undefined') {
            this.label = this.formatFromData(data, this.data.label);
        }
    }
}
