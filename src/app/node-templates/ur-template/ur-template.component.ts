import { Component } from '@angular/core';
import { BaseNode } from '../ur-base-node';

declare var $: any;
@Component({
    selector: 'app-ur-template',
    templateUrl: './ur-template.component.html',
    styleUrls: ['./ur-template.component.sass'],
    host: { 'class': 'col-lg-4 col-md-4 col-sm-6 col-xs-12' },
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
        // escape any funky symbols in the node ID
        let nodeId = $.escapeSelector(this.nodeId);
        // Substite any $node references in the template code
        let html = this.data.format.replace(/\$node/g, `$("#${nodeId}")`);
        this.container.html($(html));
    }

    updateValue(data:any) {
        super.updateValue(data);
        if (data && data.msg && data.msg.topic && typeof data.msg.payload !== 'undefined') {
            // process any elements with topic attributes
            let elements = this.container.find(`[topic='${data.msg.topic}']`);
            elements.filter("input, select").val(data.msg.payload);
            elements.not("img, input, select").html(data.msg.payload);
        }
    }
}
