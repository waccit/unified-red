import { Component, OnInit } from '@angular/core';
import { CurrentUserService, RoleService, SnackbarService, WebSocketService } from '../../services';
import { BaseNode } from '../ur-base-node';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

interface Unit {
    value: string;
    viewValue: string;
}
export interface chartConfiguration {
    xrange: string;
    xrangeunits: string;
    xmax: string;
    xmin: string;
    ymin: string;
    ymax: string;
    live: boolean;
    topics: any[];
}

@Component({
    selector: 'app-ur-chart',
    templateUrl: './ur-chart.component.html',
    styleUrls: ['./ur-chart.component.sass'],
})
export class UrChartComponent extends BaseNode implements OnInit {
    units: Unit[] = [
        { value: '1', viewValue: 'sec' },
        { value: '60', viewValue: 'min' },
        { value: '3600', viewValue: 'hr' },
        { value: '86400', viewValue: 'day(s)' },
        { value: '2592000', viewValue: 'month(s)' },
        { value: '31104000', viewValue: 'year(s)' },
    ];

    config: chartConfiguration;
    dataSource: {};
    graphedResults: any[];
    private _liveSub: Subscription;

    chartOpt = {
        autoScale: true,
        showYAxisLabel: false,
        showXAxisLabel: true,
        xAxisLabel: '',
        yAxisLabel: '',
        xScaleMin: null,
        xScaleMax: null,
        yScaleMin: null,
        yScaleMax: null,
        colorScheme: {
            domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
        }
    };

    queryParams: any;
    topics: Array<string> = [];
    alias = {};
    currentTime: Date;
    timeValue: number;
    selectedUnit: number;
    showSeries = {};

    constructor(
        protected webSocketService: WebSocketService,
        protected currentUserService: CurrentUserService,
        protected roleService: RoleService,
        protected snackbar: SnackbarService,
        protected http: HttpClient
    ) {
        super(webSocketService, currentUserService, roleService, snackbar);
    }

    ngOnInit(): void {
        this.config = this.data;
        this.timeValue = parseFloat(this.config.xrange);
        for (const topic of this.config.topics) {
            this.topics.push(topic.def);
            this.alias[topic.def] = topic.alias;
            this.showSeries[topic.alias] = true;
        }
        this.selectedUnit = parseFloat(this.config.xrangeunits);
        this.graphChart(this.config.live);
    }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.setupDatapointAccess();
    }

    ngOnDestroy(): void {
        if (this._liveSub) {
            this._liveSub.unsubscribe();
        }
    }

    startTimeValue(timeValue: any) {
        this.timeValue = parseFloat(timeValue);
        this.queryParams.startTimestamp = new Date(
            this.currentTime.getTime() - this.timeValue * this.selectedUnit * 1000
        );
        this.getData();
    }

    startTimeUnits(value: any) {
        this.selectedUnit = parseFloat(value);
        this.queryParams.startTimestamp = new Date(
            this.currentTime.getTime() - this.timeValue * this.selectedUnit * 1000
        );
        this.getData();
    }

    // endTime(event: any) {
    //     this.queryParams.endTimestamp = event.target.value;
    //     this.getData();
    // }

    graphChart(live: any) {
        this.currentTime = new Date();
        this.queryParams = {
            topic: this.topics, //['some/sensor/a','some/sensor/b'],
            startTimestamp: new Date(this.currentTime.getTime() - this.timeValue * this.selectedUnit * 1000),
            endTimestamp: this.currentTime,
            // value: any,
            lowValue: parseFloat(this.config.ymin),
            highValue: parseFloat(this.config.ymax),
            // status: string,
            // tags: string[]
        };
        if (isNaN(this.queryParams.lowValue)) {
            this.chartOpt.autoScale = true;
            this.chartOpt.yScaleMin = null;
        } else {
            this.chartOpt.autoScale = false;
            this.chartOpt.yScaleMin = this.queryParams.lowValue;
        }
        this.chartOpt.yScaleMax = this.queryParams.highValue;
        this.getData();
        if (live) {
            this._liveSub = this.webSocketService.listen('ur-datalog-update').subscribe(this.liveData);
        } else {
            if (this._liveSub) {
                this._liveSub.unsubscribe();
            }
        }
    }

    getData() {
        this.http
            .put('/api/datalog/', this.queryParams)
            .pipe()
            .subscribe(
                (data: any) => {
                    this.dataSource = data.reduce((out, entry) => {
                        let alias = this.alias[entry.topic] || entry.topic;
                        if (!out.hasOwnProperty(alias)) {
                            out[alias] = {
                                name: alias,
                                series: [],
                            };
                        }
                        out[alias].series.push({ name: new Date(entry.timestamp), value: entry.value });
                        return out;
                    }, {});
                    this.graphedResults = Object.values(this.dataSource);
                },
                (error) => {
                    this.snackbar.error(error);
                }
            );
    }

    liveData(data: any) {
        this.chartOpt.xScaleMax = new Date(data.payload.timestamp);
        this.chartOpt.xScaleMin = new Date(
            this.chartOpt.xScaleMax.getTime() - this.timeValue * this.selectedUnit * 1000
        );
        this.dataSource[data.payload.topic].series.push({
            name: new Date(data.payload.timestamp),
            value: data.payload.value,
        });
    }

    onActivate(data): void {
        // console.log('Activate', JSON.parse(JSON.stringify(data)));
    }

    onDeactivate(data): void {
        // console.log('Deactivate', JSON.parse(JSON.stringify(data)));
    }

    onSelect(name) {
        let data = JSON.parse(JSON.stringify(this.graphedResults)); // clone data
        const isShown = this.showSeries[name]; //data.some(t => t.name === name && t.series.length);
        if (isShown) {
            // topic shown, so hide
            this.showSeries[name] = false;
            for (let entry of data) {
                if (entry.name === name) {
                    entry.series = [];
                    break;
                }
            }
        } else {
            // topic hidden, so show
            this.showSeries[name] = true;
            // rebuild data when showing series in ngx-charts as work around for ngx-charts bug
            // if you add the data series only (and do not rebuild), ngx-charts will graph the data series to the right of the existing chart
            for (let entry of data) {
                if (this.showSeries[entry.name]) {
                    entry.series = this.dataSource[entry.name].series;
                } else {
                    entry.series = [];
                }
            }
        }
        this.graphedResults = data;
    }
}
