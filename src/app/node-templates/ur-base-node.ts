import { ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CurrentUserService, RoleService, SnackbarService, WebSocketService } from '../services';
import { Subscription } from 'rxjs';
import { User } from '../data';

declare var $: any;

export class BaseNode implements AfterViewInit, OnDestroy {
    label = 'default';
    access: any = {};
    private _data: any;
    private _wsSubscription: Subscription;
    @ViewChild('container', { static: true }) private _container: ElementRef;

    constructor(
        protected webSocketService: WebSocketService,
        protected currentUserService: CurrentUserService,
        protected roleService: RoleService,
        protected snackbar: SnackbarService
    ) {}

    ngAfterViewInit(): void {
        this.webSocketService.join(this.nodeId);
        this._wsSubscription = this.webSocketService.listen('update-value').subscribe((msg: any) => {
            if (msg && msg.id && this.nodeId === msg.id) {
                this.updateValue(msg);
            }
        });
        this.webSocketService.emit('ui-replay-state', {
            id: this.nodeId
        });

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
        this.webSocketService.leave(this.nodeId);
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
            // handle dynamic page. substitute {x}
            if (this.data?.instance?.number && msg.topic) {
                msg.topic = msg.topic.replace(/\{x\}/ig, this.data.instance.number);
            }
            this.webSocketService.emit({ id: this.nodeId, msg });
        }
    }

    format(data) {
        let ret = data;
        const expression = /^\{\{([^\}]*)\}\}$/.exec(this.data.format);
        if (expression.length >= 2) {
            for (const part of expression[1].split('.')) {
                ret = ret[part];
            }
        }
        return ret;
    }

    setupAccess(aclkey: string) {
        this.currentUserService.currentUser.subscribe((user: User) => {
            if (user) {
                if (!this.data.access || this.data.access === '0') {
                    this.access = this.roleService.getRoleAccess(aclkey, user.role);
                }
                else {
                    this.access = this.roleService.overrideRoleAccess(aclkey, user.role, this.data.access);
                }
            }
        });
    }

    setupDatapointAccess() {
        this.setupAccess('datapoint');
    }

    setupScheduleAccess() {
        this.setupAccess('schedules');
    }

    setupTrendsAccess() {
        this.setupAccess('trends');
    }

    setupAlarmsAccess() {
        this.setupAccess('alarms');
    }
}
