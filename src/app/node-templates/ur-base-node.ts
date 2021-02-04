import { ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CurrentUserService, RoleService, SnackbarService, WebSocketService } from '../services';
import { Subscription } from 'rxjs';
import { User } from '../data';

declare var $: any;

export class BaseNode implements AfterViewInit, OnDestroy {
    protected expressionGlobals = `
        function interpolate(value, minIn, maxIn, minOut, maxOut) {
            let out = minOut + (maxOut - minOut) * ((value - minIn) / (maxIn - minIn));
            return Math.max(minOut, Math.min(maxOut, out));
        }
    `;

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
    }

    updateValue(data: any) {
        if (data.msg.hasOwnProperty('health') && data.msg.health !== 'normal' && data.msg.hasOwnProperty('payload')) {
                let symbol = '';
                switch (data.msg.health.toLowerCase()) {
                    case 'down': symbol = '\u2757'; break;
                }
                data.msg.payload = symbol + data.msg.payload;
        }
        if (this.container && this.container.length) {
            this.container.trigger([data]);
        }
    }

    send(msg: any) {
        if (this.nodeId) {
            // handle dynamic page. substitute {variables}
            msg.topic = this.evalVariables(msg.topic);
            this.webSocketService.emit({ id: this.nodeId, msg });
        }
    }

    evalVariables(str) {
        // handle dynamic page. substitute {variables}
        let instance = this.data?.instance;
        if (instance?.parameters && str) {
            let variables = str.toLowerCase().match(/\{[^\}\/\+\#]+\}/g);
            if (variables) {
                for (let variable of variables) {
                    variable = variable.slice(1,-1); // remove braces
                    let param = instance.parameters[variable];
                    if (typeof param !== 'undefined') {
                        str = str.replace(new RegExp('\{' + variable + '\}', 'ig'), param);
                    }
                }
            }
        }
        else if (instance?.number && str) { // old. TODO: remove
            str = str.replace(/\{x\}/ig, instance.number);
        }
        return str;
    }

    // Example format expressions:
	// {{msg.payload.value}}
	// parseInt({{msg.payload.value}} / 10)
	// parseInt(1 + {{msg.payload.value}} / (100 / 9))
	// Math.round({{msg.payload.value}} / 10)
	// parseInt( interpolate({{msg.payload.value}}, 0, 100, 1, 10) )
	// Enumeration {{msg.payload.value | enum: '0:Offline, 1:Cooling, 2:Economizer, 3:Reheat, 4:Heat'}}
    formatFromData(data, format = this.data.format) {
        let ret = format;
        const expression = format.match(/\{\{[^\}]*\}\}/g);
        if (expression.length) {
            for (const exp of expression) {
                let value = data;
                let pipedExp = /\{\{([^\}\s]+)(?:\s*\|\s*enum\:\s*['"]([^\}]+)['"])?\}\}/g.exec(exp);
                let inner = pipedExp[1];
                let enums = pipedExp[2];
                for (const part of inner.split('.')) {
                    value = value[part];
                }
                if (enums && enums.length) {
                    try {
                        let enumMap = enums.split(/\s*,\s*/g)
                            .reduce((a, b) => {
                                var v = b.split(/\s*[:=]\s*/);
                                a[v[0]] = v[1];
                                return a;
                            }, {});
                        value = enumMap[value];
                    } catch (ignore) {}
                }
                let escapedExp = exp.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
                ret = ret.replace(new RegExp(escapedExp, 'g'), value);
            }
        }
        try {
			return eval('(' + ret + '); ' + this.expressionGlobals);
		} catch (ignore) {}
		return ret;
    }

    formatAndSend(topic, value, format = this.data.format) {
        let data = { 
            msg: { topic: topic }
        };
        const expression = /^\{\{([^\}]*)\}\}$/.exec(format);
        if (expression.length >= 2 && value) {
            let walk = data;
            const parts = expression[1].split('.');
            for (let i = 0; i < parts.length; i++) {
                if (i === parts.length - 1) {
                    walk[ parts[i] ] = value;
                }
                else {
                    if (!walk[ parts[i] ]) {
                        walk[ parts[i] ] = {};
                    }
                    walk = walk[ parts[i] ];
                }
            }
        }
        this.send(data.msg);
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
