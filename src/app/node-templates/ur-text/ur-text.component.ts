import { Component } from '@angular/core';
import { BaseNode } from '../ur-base-node';

@Component({
    selector: 'app-ur-text',
    templateUrl: './ur-text.component.html',
    styleUrls: ['./ur-text.component.sass'],
})
export class UrTextComponent extends BaseNode {
    text: any;

    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && typeof data.msg.payload !== 'undefined') {
            this.text = this.format(data);
        }
    }

    // getBgColor(): string {
    //     return localStorage.getItem('choose_skin_active') || 'orange';
    // }
}
