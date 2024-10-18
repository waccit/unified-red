import { AfterViewInit, Component } from '@angular/core';
import { BaseNode } from '../ur-base-node';

@Component({
    selector: 'app-ur-button',
    templateUrl: './ur-button.component.html',
    styleUrls: ['./ur-button.component.sass'],
})
export class UrButtonComponent extends BaseNode implements AfterViewInit {
    label: string;
    intopic: string;

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.setupDatapointAccess();
        this.label = this.data.label.includes('{{') ? '' : this.data.label;
    }

    send(msg: any = {}) {
        msg.topic = this.intopic || this.data.topic;
        super.send(msg);
    }

    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && typeof data.msg.payload !== 'undefined') {
            this.label = this.formatFromData(data, this.data.label);
        }
        if (data.msg.topic.includes(this.data.topic)) {
            this.intopic = data.msg.topic;
        }
        this.styleService.setStyle(data);
		this.styleService.setClass(data);
    }
}
