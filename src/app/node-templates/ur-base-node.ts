import { ElementRef, ViewChild, AfterViewInit } from "@angular/core";
import { WebSocketService } from '../services';

declare var $: any;

export class BaseNode implements AfterViewInit {
    label: string = 'default';
    private _data: any;
    @ViewChild('container', { static: true }) private _container: ElementRef;
    
    constructor(private webSocketService: WebSocketService) {}

    ngAfterViewInit(): void {
        this.webSocketService.listen('update-value').subscribe((msg: any) => {
            if (msg && msg.id && this.nodeId == msg.id) {
                this.updateValue(msg);
            }
        });

        // Add send event to jQuery element
        this.container.on("send", (evt, msg) => {
            this.send(msg);
        });
    }

    get container() {
        return this._container ? $(this._container.nativeElement) : null;
    }

    get nodeId(): string {
        return this.data ? this.data.id : null;
    }

    get data() {
        return this._data;
    }

    set data(data:any) {
        this._data = data;
        this.label = this.data.label;
    }

    updateValue(msg:any) {
        this.container.trigger('update-value', [msg]);
    }

    send(msg:any) {
        if (this.nodeId) {
            this.webSocketService.emit('update-value', { id: this.nodeId, msg: msg });
        }
    }
}