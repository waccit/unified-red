import { Component, OnInit } from '@angular/core';
import {
    CurrentUserService,
    DataLogService,
    NodeRedApiService,
    RoleService,
    SnackbarService,
    WebSocketService,
} from '../../services';
import { BaseNode } from '../ur-base-node';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

declare const $: any;

@Component({
    selector: 'app-ur-alarm',
    templateUrl: './ur-alarm.component.html',
    styleUrls: ['./ur-alarm.component.sass'],
})
export class UrAlarmComponent extends BaseNode implements OnInit {
    /*
     *      Alarm Members
     */
    alarmOpt = {
        delayon: null,
        delayoff: null,
        checkall: true,
        ackreq: true,
        name: null,
        propertyType: null,
        property: null,
        rules: null,
    };

    graphedResults: any[];
    private conditions: Array<string> = [];
    data_valid: boolean = true;
    data2_valid: boolean = true;
    msgFlag: boolean = true;
    addFlag: boolean = true;
    valueTypeMap = {
        'msg': 'msg.',
        'flow': 'flow.',
        'global': 'global.',
        'jsonata': 'JSONata expression ',
        'env': 'environment variable ',
    };
    dataTypeMap = {
        'msg': 'msg.',
        'flow': 'flow.',
        'global': 'global.',
        'str': 'string ',
        'num': 'number ',
        'jsonata': 'JSONata expression',
        'env': 'environment variable ',
        'prev': 'previous value ',
    };
    operatorMap = {
        'neq': 'not equal to',
        'lt': 'less than',
        'eq': 'equal to',
        'lte': 'less than or equal to',
        'gt': 'greater than',
        'gte': 'greater than or equal to',
        'hask': 'has key',
        'btwn': 'between',
        'cont': 'contains',
        'regex': 'regex',
        'true': 'true',
        'false': 'false',
        'null': 'null',
        'nnull': 'not null',
        'istype': 'is type',
        'empty': 'empty',
        'nempty': 'not empty',
        'jsonata_exp': 'JSONata Expression',
    };

    alarmForm: FormGroup;
    conditionsDisplayedColumns: string[] = ['condition', 'actions'];
    dirty = false;
    live = new BehaviorSubject<boolean>(false);

    constructor(
        protected webSocketService: WebSocketService,
        protected currentUserService: CurrentUserService,
        protected roleService: RoleService,
        protected snackbar: SnackbarService,
        private dataLogService: DataLogService,
        private formBuilder: FormBuilder,
        private red: NodeRedApiService
    ) {
        super(webSocketService, currentUserService, roleService, snackbar);
    }

    // validation on number type

    ngOnInit(): void {
        this.alarmForm = this.formBuilder.group({
            severity: [Validators.required],
            operator: [Validators.required],
            dataType: null,
            data: null,
            data2Type: null,
            data2: null,
            ignoreCase: null,
        });
    }

    setDirty() {
        this.dirty = true;
    }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.setupAlarmsAccess();
        if (this.conditions && this.conditions.length) {
            this.webSocketService.join(this.conditions);
        }
    }

    removeEntry(entry, severity) {
        this.data.rules[severity] = this.data.rules[severity].filter((t) => {
            return t !== entry;
        });
        this.setDirty();
    }

    addCondition(severity) {
        let ruleCategory = this.data.rules[severity];
        this.data.rules[severity] = [...ruleCategory, {}];
        this.snackbar.success('Added successfully!');
    }

    editCondition(row, severity, index) {
        this.data.rules[severity][index] = row;
    }

    formatOutput(formInfo) {
        let fields = {};

        if (['true', 'false', 'null', 'nnull', 'empty', 'nempty'].includes(formInfo['t'])) {
            fields = {
                't': formInfo['t'],
            };
        } else if (formInfo['t'] === 'istype') {
            console.log('istype');
            if (formInfo['vt'] || formInfo['vt'] === 'undefined') {
                console.log('valid');
                fields = {
                    't': formInfo['t'],
                    'v': formInfo['vt'],
                    'vt': formInfo['vt'],
                };
            } else {
                this.addFlag = false;
            }
        } else if (formInfo['t'] === 'jsonata_exp') {
            if (formInfo['v']) {
                fields = {
                    't': formInfo['t'],
                    'v': String(formInfo['v']),
                    'vt': 'jsonata',
                };
            } else {
                this.addFlag = false;
            }
        } else if (['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'hask', 'cont'].includes(formInfo['t'])) {
            if (formInfo['vt'] && formInfo['v']) {
                fields = {
                    't': formInfo['t'],
                    'v': String(formInfo['v']),
                    'vt': formInfo['vt'],
                };
            } else {
                this.addFlag = false;
            }
        } else if (formInfo['t'] === 'btwn') {
            if (formInfo['vt'] && formInfo['v'] && formInfo['v2t'] && formInfo['v2']) {
                fields = {
                    't': formInfo['t'],
                    'v': String(formInfo['v']),
                    'vt': formInfo['vt'],
                    'v2': String(formInfo['v2']),
                    'v2t': formInfo['v2t'],
                };
            } else {
                this.addFlag = false;
            }
        } else {
            if (formInfo['vt'] && formInfo['v'] && formInfo['case']) {
                fields = {
                    't': formInfo['t'],
                    'v': String(formInfo['v']),
                    'vt': formInfo['vt'],
                    'case': formInfo['case'],
                };
            } else {
                this.addFlag = false;
            }
        }
        return fields;
    }

    deploy() {
        this.addFlag = true;
        for (let severity in this.data.rules) {
            for (let condition in this.data.rules[severity]) {
                let fields = this.formatOutput(this.data.rules[severity][condition]);
                if (this.addFlag) {
                    this.data.rules[severity][condition] = fields;
                } else {
                    this.snackbar.error('A condition is missing information!');
                    console.log('fld', fields);
                    console.log(severity, this.data.rules[severity][condition]);
                    return;
                }
            }
        }

        const baseNodeId = this.getBaseNodeId(this.data.id);
        const nodesToReplace = [baseNodeId];
        this.red
            .deployNodes(nodesToReplace, (existing) => {
                switch (existing.id) {
                    case baseNodeId:
                        existing.delayon = this.data.delayon;
                        existing.delayoff = this.data.delayoff;
                        existing.checkall = this.data.checkall;
                        existing.ackreq = this.data.ackreq;
                        existing.name = this.data.name;
                        existing.property = this.data.property;
                        existing.propertyType = this.data.propertyType;
                        existing.rules = this.data.rules;
                        break;
                }
                this.msgFlag = true;
                return existing;
            })
            .subscribe((response: any) => {
                if (response?.rev && this.msgFlag) {
                    this.snackbar.success('Deployed successfully!');
                }
            });
        this.send({
            payload: {},
            point: 'Alarm',
        });
    }
}
