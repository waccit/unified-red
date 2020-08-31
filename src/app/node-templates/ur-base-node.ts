import { ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { WebSocketService } from '../services';
import { Subscription } from 'rxjs';

declare var $: any;

export class BaseNode implements AfterViewInit, OnDestroy {
    label: string = 'default';
    private _data: any;
    private _wsSubscription: Subscription;
    @ViewChild('container', { static: true }) private _container: ElementRef;

    constructor(protected webSocketService: WebSocketService) {}

    ngAfterViewInit(): void {
        this._wsSubscription = this.webSocketService.listen('update-value').subscribe((msg: any) => {
            if (msg && msg.id && this.nodeId == msg.id) {
                this.updateValue(msg);
            }
        });
        this.webSocketService.emit('ui-replay-state', {});

        // Add send event to jQuery element
        if (this.container) {
            this.container.on('send', (evt, msg) => {
                this.send(msg);
            });
        }
    }

    ngOnDestroy(): void {
        if (this._wsSubscription) {
            this._wsSubscription.unsubscribe();
        }
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

    format(data) {
        let ret = data;
        let expression = /^\{\{([^\}]*)\}\}$/.exec(this.data.format);
        if (expression.length >= 2) {
            for (let part of expression[1].split('.')) {
                ret = ret[part];
            }
        }
        return ret;
    }
}
