import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
    CurrentUserService,
    DataLogService,
    NodeRedApiService,
    RoleService,
    SnackbarService,
    WebSocketService,
} from '../../services';
import { BaseNode } from '../ur-base-node';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { MatTable } from '@angular/material/table';

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
    dataSources: { [key: string]: any[] } = {};
    @ViewChild(MatTable) table: MatTable<any>;
    msgFlag: boolean = true;
    addFlag: boolean = true;
    severities = ['alert', 'critical', 'info', 'warning'];
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
    common_fields = ['name', 'propertyType', 'property', 'delayon', 'delayoff', 'checkall', 'ackreq'];

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
        private red: NodeRedApiService,
        private cdr: ChangeDetectorRef
    ) {
        super(webSocketService, currentUserService, roleService, snackbar);
    }

    ngOnInit(): void {
        this.alarmForm = this.formBuilder.group({
            name: [this.data.name, Validators.required],
            propertyType: [this.data.propertyType, Validators.required],
            property: [this.data.property, Validators.required],
            delayon: [this.data.delayon, Validators.required],
            delayoff: [this.data.delayoff, Validators.required],
            checkall: [this.data.checkall, Validators.required],
            ackreq: [this.data.ackreq, Validators.required],

            alert: this.formBuilder.array([]),
            critical: this.formBuilder.array([]),
            info: this.formBuilder.array([]),
            warning: this.formBuilder.array([]),
        });
        const alert_array = this.alarmForm.get('alert') as FormArray;
        const critical_array = this.alarmForm.get('critical') as FormArray;
        const info_array = this.alarmForm.get('info') as FormArray;
        const warning_array = this.alarmForm.get('warning') as FormArray;

        const formArrays = {
            alert: alert_array,
            critical: critical_array,
            info: info_array,
            warning: warning_array,
        };

        for (const [key] of Object.entries(this.data.rules)) {
            for (let rule of this.data.rules[key]) {
                formArrays[key].push(
                    this.formBuilder.group({
                        t: [rule.t, Validators.required],
                        vt: [rule.vt],
                        v: [rule.v],
                        v2t: [rule.v2t],
                        v2: [rule.v2],
                        case: [rule.case],
                    })
                );
            }
        }
        this.severities.forEach((severity) => {
            this.dataSources[severity] = this.getSeverityArray(severity).controls;
        });
    }

    getSeverityArray(severity: string): FormArray {
        return this.alarmForm.get(severity) as FormArray;
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

    removeEntry(index: number, severity: string) {
        this.getSeverityArray(severity).removeAt(index);
        this.setDirty();
        this.table.renderRows();
    }

    addCondition(severity: string) {
        this.getSeverityArray(severity).push(
            this.formBuilder.group({
                t: ['', Validators.required],
                vt: [''],
                v: [''],
                v2t: [''],
                v2: [''],
                case: [''],
            })
        );
        this.snackbar.success('Added successfully!');
        this.table.renderRows();
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
            if (formInfo['vt'] || formInfo['vt'] === 'undefined') {
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
        let rules = {
            'alert': [],
            'critical': [],
            'info': [],
            'warning': [],
        };

        this.addFlag = true;

        for (let severity of this.severities) {
            for (let condition of this.dataSources[severity]) {
                let temp_condition = this.formatOutput(condition.value);
                if (!this.addFlag) {
                    this.snackbar.error('A condition is missing information!');
                    return;
                }
                rules[severity].push(temp_condition);
            }
        }

        this.data.rules = rules;

        for (let field of this.common_fields) {
            this.data[field] = this.alarmForm.get(field).value;
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
