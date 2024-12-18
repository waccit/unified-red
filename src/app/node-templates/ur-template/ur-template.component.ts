import { Component, AfterViewInit, Renderer2 } from '@angular/core';
import { CurrentUserService, RoleService, SnackbarService, WebSocketService } from '../../services';
import { BaseNode } from '../ur-base-node';
import { StyleService } from '../../services/style.service';

declare var $: any;
@Component({
    selector: 'app-ur-template',
    templateUrl: './ur-template.component.html',
    styleUrls: ['./ur-template.component.sass'],
})
export class UrTemplateComponent extends BaseNode implements AfterViewInit {
    constructor(
        protected webSocketService: WebSocketService,
        protected currentUserService: CurrentUserService,
        protected roleService: RoleService,
        protected snackbar: SnackbarService,
        public styleService: StyleService,
        protected renderer: Renderer2
    ) {
        super(webSocketService, currentUserService, roleService, snackbar, styleService, renderer);
        this.processHealthIndicator = false;
    }

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
        // Substitute any $node references in the template code
        let html = this.data.format.replace(/\$node/g, `$("#${nodeId}")`);
        html = this.evalInstanceParameters(html); // handle multi-page. substitute {variables}
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
        } else if (this.data.accessBehavior === 'disable') {
            this.container.find('input, select, button').attr('disabled', 'disabled');
        }
        this.container.find('[title]').tooltip();
        this.container.find('[popover],[data-toggle=popover]').popover();
    }

    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && data.msg.topic && typeof data.msg.payload !== 'undefined') {
            const that = this;
            try {
                data.msg.payload = JSON.parse(data.msg.payload);
            } catch (ignore) { }
            this.container.trigger('update-value', data);
            // process any elements with feedback topic attributes
            const elements = this.container.find('[feedback]').filter(function () {
                return data.msg.topic.indexOf($(this).attr('feedback')) !== -1;
            });
            elements.filter('input, select').each(function () {
                let format = $(this).attr('format') || '{{msg.payload.value}}';
                $(this).val(that.formatFromData(data, format));
            });
            elements.not('img, input, select').each(function () {
                let format = $(this).attr('format') || '{{msg.payload.value}}';
                $(this).html(that.formatFromData(data, format));
            });
        }
    }
}
