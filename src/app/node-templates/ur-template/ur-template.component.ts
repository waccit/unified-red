import { Component, AfterViewInit } from '@angular/core';
import { BaseNode } from '../ur-base-node';

declare var $: any;
@Component({
    selector: 'app-ur-template',
    templateUrl: './ur-template.component.html',
    styleUrls: ['./ur-template.component.sass'],
})
export class UrTemplateComponent extends BaseNode implements AfterViewInit {
    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.setupDatapointAccess();
        if (!this.data || !this.data.format) {
            this.container.html('No template code found');
            return;
        }
        if (this.access.read || this.data.accessBehavior !== 'hide') {
            this.appendHtml();
        }
    }

    private appendHtml() {
        const that = this;
        // Escape any funky symbols in the node ID
        const nodeId = this.nodeId.replace(/(\W)/g, '\\\\$1');
        // Substite any $node references in the template code
        const html = this.data.format.replace(/\$node/g, `$("#${nodeId}")`);
        this.container.html($(html));
        // process any elements with request topic attributes
        if (this.access.write) {
            this.container.find('input[request], select[request]').change(function () {
                const msg = {
                    topic: $(this).attr('request'),
                    payload: $(this).val(),
                };
                that.send(msg);
            });
        }
        else if (this.data.accessBehavior === 'disable') {
            this.container.find('input, select, button').attr('disabled','disabled');
        }
    }

    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && data.msg.topic && typeof data.msg.payload !== 'undefined') {
            // process any elements with feedback topic attributes
            const elements = this.container.find(`[feedback='${data.msg.topic}']`);
            elements.filter('input, select').val(data.msg.payload);
            elements.not('img, input, select').html(data.msg.payload);
        }
    }
}
