import { Component, OnInit } from '@angular/core';
import { CurrentUserService, DataLogService, NodeRedApiService, RoleService, SnackbarService, WebSocketService } from '../../services';
import { BaseNode } from '../ur-base-node';
import { BehaviorSubject, Subscription } from 'rxjs';
import { LargestTriangleThreeBuckets } from './LargestTriangleThreeBuckets';
import * as shape from 'd3-shape';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataLogDataSource, DataLogQuery } from '../../data';

declare const $: any;

@Component({
    selector: 'app-ur-chart',
    templateUrl: './ur-chart.component.html',
    styleUrls: ['./ur-chart.component.sass'],
})
export class UrChartComponent extends BaseNode implements OnInit {
    /*
     *      Chart Members
     */
    chartOpt = {
        animation: false,
        legendPosition: 'right',
        autoScale: true,
        showYAxisLabel: false,
        showXAxisLabel: true,
        xAxisLabel: '',
        yAxisLabel: '',
        xScaleMin: null,
        xScaleMax: null,
        yScaleMin: null,
        yScaleMax: null,
        curve: null,
        colorScheme: {
            domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
        },
    };

    private liveSubscription: Subscription;
    private graphDataSource: {};
    graphedResults: any[];
    private queryParams: DataLogQuery;
    private topics: Array<string> = [];
    private labels = {};
    private showSeries = {};
    private lttb = new LargestTriangleThreeBuckets();
    private nativeTimestamp = true;

    /*
     *      Table Members
     */
    tableDisplayedColumns: string[] = ['timestamp', 'name', 'value'];
    tableDataSource: DataLogDataSource;
    exporterOpt = {};

    /*
     *      Settings Members
     */
    topicForm: FormGroup;
    referenceLineForm: FormGroup;
    colorForm: FormGroup;
    topicsDisplayedColumns: string[] = ['label', 'topic', 'actions'];
    refLinesDisplayedColumns: string[] = ['name', 'value', 'actions'];
    availableTopics = [];
    dirty = false;
    sampled = true;
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

    ngOnInit(): void {
        for (let topic of this.data.topics) {
            topic.topic = this.evalInstanceParameters(topic.topic); // handle multi-page. substitute {variables}
            this.topics.push(topic.topic);
            this.labels[topic.topic] = topic.label;
            this.showSeries[topic.label] = true;
        }

        // Init settings
        this.dataLogService.listTopics().pipe(first()).subscribe(
            (data: any) => { this.availableTopics = data; },
            (error) => { this.snackbar.error(error); }
        );
        this.topicForm = this.formBuilder.group({ 
            label: ['', Validators.required],
            topic: ['', Validators.required]
        });
        this.referenceLineForm = this.formBuilder.group({ 
            name: ['', Validators.required],
            value: ['', Validators.required]
        });
        this.colorForm = this.formBuilder.group({ 
            color1: [ this.data.colors[0], Validators.required ],
            color2: [ this.data.colors[1], Validators.required ],
            color3: [ this.data.colors[2], Validators.required ],
            color4: [ this.data.colors[3], Validators.required ],
            color5: [ this.data.colors[4], Validators.required ],
            color6: [ this.data.colors[5], Validators.required ],
            color7: [ this.data.colors[6], Validators.required ],
            color8: [ this.data.colors[7], Validators.required ],
            color9: [ this.data.colors[8], Validators.required ],
            color10: [ this.data.colors[9], Validators.required ],
            color11: [ this.data.colors[10], Validators.required ],
            color12: [ this.data.colors[11], Validators.required ],
        });
        this.live.subscribe(live => {
            if (live) {
                if (!this.liveSubscription) {
                    this.liveSubscription = this.webSocketService.listen('ur-datalog-update').subscribe(data => {
                        this.liveData(data);
                    });
                }
            } else {
                if (this.liveSubscription) {
                    this.liveSubscription.unsubscribe();
                }
            }
        });
        this.exporterOpt = {
            fileName: 'Unified Datalog' + (this.data.label.length ? ' ' + this.data.label : '')
        };
    

        // Init table and graph
        this.queryParams = {
            limit: 50000,
            topic: this.topics,
            startTimestamp: new Date(new Date().getTime() - this.data.xrange * this.data.xrangeunits * 1000),
            // endTimestamp: this.currentTime,
            // value: any,
            // lowValue: parseFloat(this.data.ymin),
            // highValue: parseFloat(this.data.ymax),
            // status: string,
            // tags: string[]
        };
        if (this.data.chartType === 'table') { // init table
            this.tableDataSource = new DataLogDataSource(this.dataLogService, this.queryParams, this.labels);
        }
        else { // init graph
            this.initGraph();
        }
        this.live.next(this.data.live);
    }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.setupTrendsAccess();
    }

    ngOnDestroy(): void {
        if (this.liveSubscription) {
            this.liveSubscription.unsubscribe();
        }
    }

    /*
     *      Chart Functions
     */

    private initGraph() {
        this.setYAxisMin(this.data.ymin);
        this.setYAxisMax(this.data.ymax);
        this.setCurve(this.data.curve);
        this.chartOpt.colorScheme.domain = this.data.colors;
        this.queryGraphData();
    }

    private refreshTime() {
        this.queryParams.startTimestamp = new Date(
            new Date().getTime() - this.data.xrange * this.data.xrangeunits * 1000
        );
        this.queryGraphData();
    }

    private queryGraphData() {
        this.dataLogService.query(this.queryParams)
            .pipe()
            .subscribe(
                (data: any) => {
                    this.graphDataSource = data.reduce((out, entry) => {
                        let label = this.chartLabel(entry);
                        let newEntry = this.chartEntry(entry);
                        if (!out.hasOwnProperty(label)) {
                            out[label] = { name: label, series: [] };
                        }
                        out[label].series.push(newEntry);
                        return out;
                    }, {});
                    this.updateGraphedResults(Object.values(this.graphDataSource));
                },
                (error) => {
                    this.snackbar.error(error);
                }
            );
    }

    private updateGraphedResults(data: any[]) {
        if (this.sampled) {
            for (let i = 0; i < data.length; i++) {
                // let origLen = data[i].series.length.toString();
                data[i].series = this.lttb.sample(data[i].series, 1440, 'name', 'value');
                // console.log("series " + data[i].name + " reduced from length " + origLen + " to " + data[i].series.length);
            }
        }
        this.graphedResults = data;
    }

    private liveData(data: any) {
        if (data.payload && this.topics.includes(data.payload.topic)) {
            if (this.data.chartType === 'table' && this.tableDataSource) {
                this.tableDataSource.add(data.payload);
            }
            else if (typeof this.graphDataSource !== 'undefined') {
                this.chartOpt.xScaleMax = new Date(data.payload.timestamp);
                this.chartOpt.xScaleMin = new Date(
                    this.chartOpt.xScaleMax.getTime() - this.data.xrange * this.data.xrangeunits * 1000
                );

                // add point to dataSource
                let label = this.chartLabel(data.payload);
                let newEntry = this.chartEntry(data.payload);
                this.graphDataSource[label].series.push(newEntry);

                // add point to graphed results
                const isShown = this.showSeries[label];
                if (isShown) {
                    for (let dataPoint of this.graphedResults) {
                        if (dataPoint.name === label) {
                            dataPoint.series.shift(); // delete first entry
                            dataPoint.series.push(newEntry); // append new entry
                            break;
                        }
                    }
                }

                // refresh chart
                this.updateGraphedResults([ ... this.graphedResults ]);
            }
        }
    }

    private chartLabel(entry) {
        let label = this.labels[entry.topic] || entry.topic;
        if (entry.units) {
            label += " (" + entry.units + ")";
        }
        return label;
    }
 
    private chartEntry(entry) {
        let timestamp = this.nativeTimestamp ? new Date(entry.timestamp) : null;
        if (!this.nativeTimestamp || !timestamp || isNaN(timestamp.getTime())) {
            let t = entry.timestamp.split(/[- :]/);
            timestamp = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));
            this.nativeTimestamp = false;
        }
        return {
            name: timestamp,
            value: entry.value,
        };
    }

    onActivate(): void {
        // console.log('Activate', data);
    }

    onDeactivate(): void {
        // console.log('Deactivate', data);
    }

    onSelect(label) {
        if (typeof label !== 'string') { // legend clicks return strings. series clicks return objects.
            return;
        }
        let legendLabel = $(".legend-label span[title='"+label+"']")
        let data = $.extend(true, [], this.graphedResults); // deep copy/clone data
        const isShown = this.showSeries[label];
        if (isShown) {
            // topic shown, so hide
            this.showSeries[label] = false;
            for (let entry of data) {
                if (entry.name === label) {
                    entry.series = [];
                    break;
                }
            }
            legendLabel.addClass("dim");
        } else {
            // topic hidden, so show
            this.showSeries[label] = true;
            // rebuild data when showing series in ngx-charts as work around for ngx-charts bug
            // if you add the data series only (and do not rebuild), ngx-charts will graph the data series to the right of the existing chart
            for (let entry of data) {
                if (this.showSeries[entry.name]) {
                    entry.series = this.graphDataSource[entry.name].series;
                } else {
                    entry.series = [];
                }
            }
            legendLabel.removeClass("dim");
        }
        this.updateGraphedResults(data);
    }

    /*
     *      Settings Functions
     */

     setDirty() {
        this.dirty = true;
     }

    setCurve(value: any) {
        this.chartOpt.curve = shape[value];
        this.data.curve = value;
    }

    setXRange(value: any) {
        this.data.xrange = parseFloat(value);
        this.refreshTime();
        this.setDirty();
    }

    setXRangeUnits(value: any) {
        this.data.xrangeunits = parseFloat(value);
        this.refreshTime();
        this.setDirty();
    }

    setYAxisMin(value: any) {
        this.data.ymin = parseFloat(value);
        if (isNaN(value)) {
            this.chartOpt.autoScale = true;
            this.chartOpt.yScaleMin = null;
        } else {
            this.chartOpt.autoScale = false;
            this.chartOpt.yScaleMin = this.data.ymin;
        }
    }

    setYAxisMax(value: any) {
        this.data.ymax = parseFloat(value);
        this.chartOpt.yScaleMax = this.data.ymax;
    }

    addTopic() {
        if (this.topicForm.invalid) {
            return;
        }
        if (!this.data.topics.find(t => t.topic === this.topicForm.value.topic)) {
            this.data.topics = [ ... this.data.topics, this.topicForm.value ];
            this.setDirty();
        }
    }

    removeTopic(topic) {
        this.data.topics = this.data.topics.filter(t => {
            return t.label !== topic.label && t.topic !== topic.topic;
        });
        this.setDirty();
    }

    addRefLine() {
        if (this.referenceLineForm.invalid) {
            return;
        }
        if (!this.data.referenceLines.find(r => r.value === this.referenceLineForm.value.value)) {
            this.data.referenceLines = [ ... this.data.referenceLines, this.referenceLineForm.value ];
            this.setDirty();
        }
    }

    removeRefLine(line) {
        this.data.referenceLines = this.data.referenceLines.filter(r => {
            return r.name !== line.name && r.value !== line.value;
        });
        this.setDirty();
    }

    updateColor() {
        if (this.colorForm.invalid) {
            return;
        }
        let cf = this.colorForm.value;
        this.data.colors = [ 
            cf.color1, cf.color2, cf.color3, cf.color4, cf.color5, cf.color6, 
            cf.color7, cf.color8, cf.color9, cf.color10, cf.color11, cf.color12
        ];
        this.chartOpt.colorScheme.domain = this.data.colors;
        this.setDirty();
    }

    deploy() {
        const nodesToReplace = [this.data.id];
        this.red
            .deployNodes(nodesToReplace, (existing) => {
                switch (existing.id) {
                    case this.data.id:
                        existing.chartType = this.data.chartType;
                        existing.topics = this.data.topics;
                        existing.xrange = this.data.xrange;
                        existing.xrangeunits = this.data.xrangeunits;
                        existing.curve = this.data.curve;
                        existing.live = this.data.live;
                        existing.legend = this.data.legend;
                        existing.showRefLines = this.data.showRefLines;
                        existing.referenceLines = this.data.referenceLines;
                        existing.timeline = this.data.timeline;
                        existing.ymin = this.data.ymin;
                        existing.ymax = this.data.ymax;
                        existing.colors = this.data.colors;
                        break;
                }
                return existing;
            })
            .subscribe((response: any) => {
                if (response?.rev) {
                    this.snackbar.success('Deployed successfully!');
                }
            });
    }
}