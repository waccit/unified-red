import { Component } from '@angular/core';
import { BaseNode } from '../ur-base-node';

declare var $: any;
@Component({
    selector: 'app-ur-template',
    templateUrl: './ur-template.component.html',
    styleUrls: ['./ur-template.component.sass'],
})
export class UrTemplateComponent extends BaseNode {
    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        if (!this.data || !this.data.format) {
            this.container.html('No template code found');
            return;
        }
        this.appendHtml();
    }

    private appendHtml() {
        // jQuery cannot handle ID's with periods. Must escape periods.
        let nodeId = this.nodeId.replace(/\./g, '\\\\.');
        // Substite any $node references in the template code
        let html = this.data.format.replace(/\$node/g, `$("#${nodeId}")`);
        this.container.html($(html));
    }
}
