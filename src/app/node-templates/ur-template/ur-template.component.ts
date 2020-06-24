import { Component } from '@angular/core';
import { BaseNode } from '../ur-base-node';

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
            this.container.innerHTML = 'No template code found';
            return;
        }
        this.appendHtml();
    }

    private appendHtml() {
        // jQuery cannot handle ID's with periods. Must escape periods.
        let nodeId = this.nodeId.replace(/\./g, '\\\\.');
        // Substite any $node references in the template code
        let html = this.data.format.replace(/\$node/g, `$("#${nodeId}")`);
        // Use createContextualFragment to ensure user scripts execute
        const executableCode = document.createRange().createContextualFragment(html);
        this.container.appendChild(executableCode);
    }
}
