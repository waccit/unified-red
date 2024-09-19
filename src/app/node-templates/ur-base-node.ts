import { ElementRef, ViewChild, AfterViewInit, OnDestroy, Directive, Renderer2  } from '@angular/core';
import { CurrentUserService, RoleService, SnackbarService, WebSocketService } from '../services';
import { Subscription } from 'rxjs';
import { User } from '../data';
import { StyleService } from '../services/style.service';

declare var $: any;

@Directive()
export class BaseNode implements AfterViewInit, OnDestroy {
    protected expressionGlobals = `
        function interpolate(value, minIn, maxIn, minOut, maxOut) {
            let out = minOut + (maxOut - minOut) * ((value - minIn) / (maxIn - minIn));
            return Math.max(minOut, Math.min(maxOut, out));
        }
    `;

    access: any = {};
    disabled: boolean = false;
    private _data: any;
    private _wsSubscription: Subscription;
    
    @ViewChild('container', { static: true }) private _container: ElementRef;
    protected processHealthIndicator: Boolean = true;

    constructor(
        protected webSocketService: WebSocketService,
        protected currentUserService: CurrentUserService,
        protected roleService: RoleService,
        protected snackbar: SnackbarService,
        protected styleService: StyleService,
        protected renderer: Renderer2
    ) { }

    ngAfterViewInit(): void {
        this.webSocketService.join(this.nodeId);
        this._wsSubscription = this.webSocketService.listen('update-value').subscribe((msg: any) => {
            if (msg && msg.id && this.nodeId === msg.id) {
                this.updateValue(msg);
            }
        });
        this.webSocketService.emit('ui-replay-state', {
            id: this.nodeId,
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

    getBaseNodeId(nodeId = this.data.id): string {
        if (nodeId) {
            let newMultiPageIdPattern = /([a-fA-F0-9]{16})\.(.+)/;
            let oldMultiPageIdPattern = /([a-fA-F0-9]+\.[a-fA-F0-9]+)\.(.+)/;
            if (oldMultiPageIdPattern.test(nodeId)) {
                // is extended node id? (multi page)
                nodeId = oldMultiPageIdPattern.exec(nodeId)[1];
            } else if (newMultiPageIdPattern.test(nodeId)) {
                // is extended node id? (multi page)
                nodeId = newMultiPageIdPattern.exec(nodeId)[1];
            }
            return nodeId;
        }
        return null;
    }

    get data() {
        return this._data;
    }

    set data(data: any) {
        this._data = data;
    }
    
    updateValue(data: any) {
        // Log the incoming data to check the payload
        console.log('updateValue called with data:', data);

        // Log the class before setting it
        console.log('Class being passed:', data.msg.payload?.class);
        if (data.msg.payload.health !== 'down' )
        {
            this.styleService.setStyle(data);
        }
        this.styleService.setClass(data);
    
    }
    

    stripHTML(str: string) {
        if (typeof str === 'string') {
            return str.replace(/<[^>]+>/g, '');
        }
        return str;
    }

    send(msg: any = {}) {
        if (this.nodeId) {
            if (typeof msg === 'undefined' || msg === null) {
                msg = {};
            }
            if (msg.topic) {
                // check if msg.topic exists, not all do, e.g. ur-button sends a null message
                msg.topic = this.evalInstanceParameters(msg.topic); // handle multi-page. substitute {variables}
            }

            if (msg.payload) {
                this.currentUserService.currentUser.subscribe((user) => {
                    msg.payload.user = user;
                    msg.payload.pageTitle = this._data.instance ? this.data.instance.pageTitle : this.data.pageTitle;
                });
            }

            this.webSocketService.emit({ id: this.nodeId, msg });
        }
    }

    evalInstanceParameters(str) {
        // handle multi-page. substitute {variables}
        let instance = this.data?.instance;
        if (instance?.parameters && str) {
            let variables = str.toLowerCase().match(/\{[^\}\/\+\#]+\}/g);
            if (variables) {
                for (let variable of variables) {
                    variable = variable.slice(1, -1); // remove braces
                    let param = instance.parameters[variable];
                    if (typeof param !== 'undefined') {
                        str = str.replace(new RegExp('{' + variable + '}', 'ig'), param);
                    }
                }
            }
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
        if (expression && expression.length) {
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
                        let enumMap = enums.split(/\s*,\s*/g).reduce((a, b) => {
                            var v = b.split(/\s*[:=]\s*/);
                            a[v[0]] = v[1];
                            return a;
                        }, {});
                        value = enumMap[value];
                    } catch (ignore) { }
                }

                if (typeof value !== 'undefined') {
                    if (typeof value === 'object') {
                        value = '(' + JSON.stringify(value) + ')';
                    } else if (!isNaN(value)) {
                        value = parseFloat(value);
                    } else if (typeof value === 'string') {
                        value = '"' + value + '"';
                    }
                }

                let escapedExp = exp.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
                ret = ret.replace(new RegExp(escapedExp, 'g'), value);
            }
        }
        try {
            return eval('(' + ret + '); ' + this.expressionGlobals);
        } catch (ignore) { }
        return ret;
    }

    formatAndSend(topic, point, value, format = this.data.format) {
        value = this.stripHTML(value);
        let data = {
            msg: { topic: topic, point: point },
        };
        const expression = /^\{\{([^\}]*)\}\}$/.exec(format);
        if (expression.length >= 2 && typeof value !== 'undefined') {
            let walk = data;
            const parts = expression[1].split('.');
            for (let i = 0; i < parts.length; i++) {
                if (i === parts.length - 1) {
                    walk[parts[i]] = value;
                } else {
                    if (!walk[parts[i]]) {
                        walk[parts[i]] = {};
                    }
                    walk = walk[parts[i]];
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
                } else {
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
