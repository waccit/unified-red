import { ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { WebSocketService } from '../services';
import { Subscription } from 'rxjs';

declare var $: any;

export class BaseNode implements AfterViewInit, OnDestroy {
    label: string = 'default';
    private _data: any;
    private _wsSubscription: Subscription;
    @ViewChild('container', { static: true }) private _container: ElementRef;

    constructor(private webSocketService: WebSocketService) {}

    ngAfterViewInit(): void {
        this._wsSubscription = this.webSocketService.listen('update-value').subscribe((msg: any) => {
            if (msg && msg.id && this.nodeId == msg.id) {
                this.updateValue(msg);
            }
        });

        // Add send event to jQuery element
        this.container.on('send', (evt, msg) => {
            this.send(msg);
        });
    }

    ngOnDestroy(): void {
        if (this._wsSubscription) {
            this._wsSubscription.unsubscribe();
        }

        // console.log(this.data.type + ' destroyed');
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

    set data(data: any) {
        this._data = data;
        this.label = this.data.label;
    }

    updateValue(data: any) {
        if (this.container && this.container.length) {
            this.container.trigger([data]);
        }
    }

    send(msg: any) {
        if (this.nodeId) {
            this.webSocketService.emit({ id: this.nodeId, msg: msg });
        }
    }
}
