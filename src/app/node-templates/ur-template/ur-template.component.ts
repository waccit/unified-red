import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { WebSocketService } from '../../services';

declare var $: any;

@Component({
    selector: 'app-ur-template',
    templateUrl: './ur-template.component.html',
    styleUrls: ['./ur-template.component.sass'],
})
export class UrTemplateComponent implements AfterViewInit {
    data: any;
    @ViewChild('container', { static: true }) container: ElementRef;

    constructor(private webSocketService: WebSocketService) {}

    ngAfterViewInit(): void {
        if (!this.data || !this.data.format) {
            this.container.nativeElement.innerHTML = 'No template code found';
            return;
        }

        this.webSocketService.listen('update-value').subscribe((data: any) => {
            if (this.data.id == data.id && data.msg) {
                // fire jQuery custom event
                $(this.container.nativeElement).trigger('update-value', [data]);
            }
        });

        // jQuery cannot handle ID's with periods. Must escape periods.
        let nodeId = this.data.id.replace(/\./g, '\\\\.');
        // Substite any $node references in the template code
        let html = this.data.format.replace(/\$node/g, `$("#${nodeId}")`);
        // Use createContextualFragment to ensure user scripts execute
        const executableCode = document.createRange().createContextualFragment(html);
        this.container.nativeElement.appendChild(executableCode);

        // Add send event to DOM element
        $(this.container.nativeElement).on("send", (evt, msg) => {
            console.log("template container send", this.data.id, msg);
            this.webSocketService.emit(this.data.id, msg);
        });
    }
}
