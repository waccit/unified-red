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
import { LargestTriangleThreeBuckets } from './LargestTriangleThreeBuckets';
import * as shape from 'd3-shape';
import { first, map, startWith } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataLogDataSource, DataLogQuery } from '../../data';
import { element } from 'protractor';

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
    private queriedStartTimestamp: Date;
    private queriedEndTimestamp: Date;
    msgFlag: boolean = true;;
    needXRange: boolean = true;

    xRangeStart;
    xRangeEnd;
  
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
    filteredTopics: Observable<string[]>;
    topicsWithVariables = [];

    constructor(
        protected webSocketService: WebSocketService,
        protected currentUserService: CurrentUserService,
        protected roleService: RoleService,
        protected snackbar: SnackbarService,
        private dataLogService: DataLogService,
        private formBuilder: FormBuilder,
        private red: NodeRedApiService,
    ) {
        super(webSocketService, currentUserService, roleService, snackbar);
    }

    ngOnInit(): void {
        for (let topic of this.data.topics) {
            topic.topicSubbed = this.evalInstanceParameters(topic.topic); // handle multi-page. substitute {variables}
            this.topics.push(topic.topicSubbed);
            this.topicsWithVariables.push(topic.topic);
            this.labels[topic.topicSubbed] = topic.label;
            this.showSeries[topic.labelSubbed] = true;
        }

        // Init settings
        this.dataLogService
            .listTopics()
            .pipe(first())
            .subscribe(
                (data: any) => {
                    this.availableTopics = data;
                },
                (error) => {
                    this.snackbar.error(error);
                }
            );
        this.topicForm = this.formBuilder.group({
            label: ['', Validators.required],
            topic: ['', Validators.required],
        });
        this.filteredTopics = this.topicForm.get('topic').valueChanges.pipe(
            startWith(''),
            map((value) => this._filter(value))
        );
        this.referenceLineForm = this.formBuilder.group({
            name: ['', Validators.required],
            value: ['', Validators.required],
        });
        this.colorForm = this.formBuilder.group({
            color1: [this.data.colors[0], Validators.required],
            color2: [this.data.colors[1], Validators.required],
            color3: [this.data.colors[2], Validators.required],
            color4: [this.data.colors[3], Validators.required],
            color5: [this.data.colors[4], Validators.required],
            color6: [this.data.colors[5], Validators.required],
            color7: [this.data.colors[6], Validators.required],
            color8: [this.data.colors[7], Validators.required],
            color9: [this.data.colors[8], Validators.required],
            color10: [this.data.colors[9], Validators.required],
            color11: [this.data.colors[10], Validators.required],
            color12: [this.data.colors[11], Validators.required],
        });
        this.live.subscribe((live) => {
            if (live) {
                if (!this.liveSubscription) {
                    this.liveSubscription = this.webSocketService.listen('ur-datalog-update').subscribe((data) => {
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
            fileName: 'Unified Datalog' + (this.data.label.length ? ' ' + this.data.label : ''),
        };

        // Init table and graph
        this.queryParams = {
            limit: 50000,
            topic: this.topics,
            startTimestamp: new Date(new Date().getTime() - this.data.xrange * this.getRangeInSeconds() * 1000)
            // startTimestamp: new Date(new Date().getTime() - this.data.xrange * this.data.xrangeunits * 1000),
            // endTimestamp: this.currentTime,
            // value: any,
            // lowValue: parseFloat(this.data.ymin),
            // highValue: parseFloat(this.data.ymax),
            // status: string,
            // tags: string[]
        };

        this.refreshTime();

        if (this.data.chartType === 'table') {
            // init table
            this.tableDataSource = new DataLogDataSource(this.dataLogService, this.queryParams, this.labels);
        } else {
            // init graph
            this.initGraph();
            // this.initGraph();
        }
        this.live.next(this.data.live);
    }

    rebuildChartAndTable() {
      this.queryParams = {
        limit: 50000,
        topic: this.topics,
        startTimestamp: new Date(new Date().getTime() - this.data.xrange * this.getRangeInSeconds() * 1000)
    };

      if (this.data.chartType === 'table') {
         // init table
          this.tableDataSource = new DataLogDataSource(this.dataLogService, this.queryParams, this.labels);
      } else {
          // init graph
          this.initGraph();
      }  
    }

    getRangeInSeconds() {
      let rangeInSeconds;

      if (
        this.data.xrangeunits === 'seconds'
        || this.data.xrangeunits === 'minutes'
        || this.data.xrangeunits === 'hours'
        || this.data.xrangeunits === 'days'
        || this.data.xrangeunits === 'months'
        || this.data.xrangeunits === 'years'
        ) {
          switch (this.data.xrangeunits) {
            case 'seconds':
              rangeInSeconds = 1;
              break;
            case 'minutes':
              rangeInSeconds = 60;
              break;
            case 'hours':
              rangeInSeconds = 3600;
              break;
            case 'days':
              rangeInSeconds = 86400;
              break;
            case 'months':
              rangeInSeconds = 2628000;
              break;
            case 'years':
              rangeInSeconds = 31556952;
              break;
          }
        }

        return rangeInSeconds;
    }

    getPSTDatetime(ISODateString: string, second?: boolean): Date | string {
        if (second) {
            return new Date(ISODateString).toLocaleString('en-US', {
                year: '2-digit',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'America/Los_Angeles',
          });
        }

        return new Date(ISODateString).toLocaleString('en-US', {
            year: '2-digit',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',   
            timeZone: 'America/Los_Angeles',
        });
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return [...this.topicsWithVariables.filter((topic) => topic.toLowerCase().includes(filterValue)), ...this.availableTopics.filter((topic) => topic.toLowerCase().includes(filterValue))];
    }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.setupTrendsAccess();
        if (this.topics && this.topics.length) {
            this.webSocketService.join(this.topics);
        }
    }

    ngOnDestroy(): void {
        if (this.liveSubscription) {
            this.liveSubscription.unsubscribe();
        }
        if (this.webSocketService) {
            this.webSocketService.leave(this.topics);
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

        // These lines repeated ensure the graph is rendered correctly
        this.setYAxisMin(this.data.ymin);
        this.setYAxisMax(this.data.ymax);
    }

    private refreshTime() {
        let currentTimestamp = new Date();
        this.queriedStartTimestamp = new Date();
        this.queriedEndTimestamp = new Date();
        this.queriedStartTimestamp.setHours(0, 0, 0, 0);
        this.queriedEndTimestamp.setHours(0, 0, 0, 0);
        this.needXRange = true;

        if (this.data.xrangeunits === 'fixed_date_range') {
          // if the start and end dates are empty in the flow
          if (!this.data.xrangeStartDate && !this.data.xrangeEndDate) {
            this.xRangeStart = new Date();
            this.xRangeStart.setHours(0, 0, 0, 0);
            this.data.xrangeStartDate = this.dateConvert(this.xRangeStart.toISOString());
            this.xRangeStart.toISOString();

            this.xRangeEnd = new Date();
            this.xRangeEnd.setHours(23, 59, 59, 0);
            this.data.xrangeEndDate = this.dateConvert(this.xRangeEnd.toISOString());
            this.xRangeEnd.toISOString();

            this.dirty = true;   
          }
          // if only the start date is empty in the flow 
          else if (!this.data.xrangeStartDate) {
            this.xRangeStart = new Date(this.data.xrangeEndDate);
            this.xRangeStart.setHours(0, 0, 0, 0);
            this.data.xrangeStartDate = this.dateConvert(this.xRangeStart.toISOString());
            this.xRangeStart.toISOString();

            this.xRangeEnd = new Date(this.data.xrangeEndDate);
            this.data.xrangeEndDate = this.dateConvert(this.xRangeEnd.toISOString());
            this.xRangeEnd.toISOString();

            this.dirty = true;
          }
          // if only the end date is empty in the flow
          else if (!this.data.xrangeEndDate) {
            this.xRangeStart = new Date(this.data.xrangeStartDate);
            this.xRangeStart.setHours(0, 0, 0, 0);
            this.data.xrangeStartDate = this.dateConvert(this.xRangeStart.toISOString());
            this.xRangeStart.toISOString();

            this.xRangeEnd = new Date(this.data.xrangeStartDate);
            this.xRangeEnd.setHours(23, 59, 59, 0);
            this.data.xrangeEndDate = this.dateConvert(this.xRangeEnd.toISOString());
            this.xRangeEnd.toISOString();

            this.dirty = true;
          }

          // if both start and end date are present
          else {
            this.xRangeStart = new Date(this.data.xrangeStartDate);
            this.xRangeEnd = new Date(this.data.xrangeEndDate);

            this.dirty = false;    
          }

          this.queriedStartTimestamp = new Date(this.data.xrangeStartDate);
          this.queriedEndTimestamp = new Date(this.data.xrangeEndDate);
          this.queriedEndTimestamp.setHours(23, 59, 59, 999);
          this.needXRange = false;
          
        } else if (this.data.xrangeunits === 'today') {
          this.queriedEndTimestamp = currentTimestamp;
          this.needXRange = false;
          this.dirty = false;

        } else if (this.data.xrangeunits === 'yesterday') {
          this.queriedStartTimestamp.setDate(this.queriedStartTimestamp.getDate() - 1);
          this.queriedEndTimestamp.setDate(this.queriedEndTimestamp.getDate() - 1);
          this.queriedEndTimestamp.setHours(23, 59, 59, 999);
          this.needXRange = false;
          this.dirty = false;

        } else if (this.data.xrangeunits === 'week_to_date') {
          this.queriedStartTimestamp.setDate(this.queriedStartTimestamp.getDate() - this.queriedStartTimestamp.getDay());
          this.queriedEndTimestamp = currentTimestamp;
          this.needXRange = false;
          this.dirty = false;

        } else if (this.data.xrangeunits === 'last_week') {
          this.queriedStartTimestamp.setDate(this.queriedStartTimestamp.getDate() - this.queriedStartTimestamp.getDay() - 7);
          this.queriedEndTimestamp.setDate(this.queriedEndTimestamp.getDate() - this.queriedEndTimestamp.getDay() - 1);
          this.queriedEndTimestamp.setHours(23, 59, 59, 999);
          this.needXRange = false;
          this.dirty = false;

        } else if (this.data.xrangeunits === 'month_to_date') {
          this.queriedStartTimestamp.setDate(1);
          this.queriedEndTimestamp = currentTimestamp;
          this.needXRange = false;
          this.dirty = false;

        } else if (this.data.xrangeunits === 'last_month') {
          this.queriedStartTimestamp.setDate(0);
          this.queriedStartTimestamp.setDate(1);
          this.queriedEndTimestamp.setDate(0);
          this.queriedEndTimestamp.setHours(23, 59, 59, 999);
          this.needXRange = false;
          this.dirty = false;

        } else if (this.data.xrangeunits === 'year_to_date') {
          this.queriedStartTimestamp.setMonth(0, 1);
          this.queriedEndTimestamp = currentTimestamp;
          this.needXRange = false;
          this.dirty = false;

        } else if (this.data.xrangeunits === 'last_year') {
          this.queriedStartTimestamp.setMonth(0, 0);
          this.queriedStartTimestamp.setMonth(0, 1);
          this.queriedEndTimestamp.setMonth(0, 0);
          this.queriedEndTimestamp.setHours(23, 59, 59, 999);
          this.needXRange = false;
          this.dirty = false;

        } else if (this.data.xrangeunits === 'years') {
          this.queriedStartTimestamp = new Date(currentTimestamp.getTime() - this.data.xrange * 31104000 * 1000);
          this.queriedEndTimestamp = currentTimestamp;
          this.dirty = false;

        } else if (this.data.xrangeunits === 'months') {
          this.queriedStartTimestamp = new Date(currentTimestamp.getTime() - this.data.xrange * 2592000 * 1000);
          this.queriedEndTimestamp = currentTimestamp;
          this.dirty = false;

        } else if (this.data.xrangeunits === 'days') {
          this.queriedStartTimestamp = new Date(currentTimestamp.getTime() - this.data.xrange * 86400 * 1000);
          this.queriedEndTimestamp = currentTimestamp;
          this.dirty = false;

        } else if (this.data.xrangeunits === 'hours') {
          this.queriedStartTimestamp = new Date(currentTimestamp.getTime() - this.data.xrange * 3600 * 1000);
          this.queriedEndTimestamp = currentTimestamp;
          this.dirty = false;

        } else if (this.data.xrangeunits === 'minutes') {
          this.queriedStartTimestamp = new Date(currentTimestamp.getTime() - this.data.xrange * 60 * 1000);
          this.queriedEndTimestamp = currentTimestamp;
          this.dirty = false;

        } else if (this.data.xrangeunits === 'seconds') {
          this.queriedStartTimestamp = new Date(currentTimestamp.getTime() - this.data.xrange * 1000);
          this.queriedEndTimestamp = currentTimestamp;
          this.dirty = false;
        }
        
        this.queryParams.startTimestamp = this.queriedStartTimestamp;
        this.queryParams.endTimestamp = this.queriedEndTimestamp;

        this.queryGraphData();
    }

    private queryGraphData() {
        this.dataLogService
            .query(this.queryParams)
            .pipe()
            .subscribe(
                (data: any) => {
                    this.graphDataSource = data.reduce((out, entry) => {
                        let timestamp = this.nativeTimestamp ? new Date(entry.timestamp) : null;
                        //Timestamp conversion for SQL Database
                        if (!this.nativeTimestamp || !timestamp || isNaN(timestamp.getTime())) {
                            let t = entry.timestamp.split(/[- :]/);
                            timestamp = new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
                            this.nativeTimestamp = false;
                        }
                        entry.timestamp = timestamp;

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
            } else if (typeof this.graphDataSource !== 'undefined') {

              if (
                this.data.xrangeunits === 'seconds'
                || this.data.xrangeunits === 'minutes'
                || this.data.xrangeunits === 'hours'
                || this.data.xrangeunits === 'days'
                || this.data.xrangeunits === 'months'
                || this.data.xrangeunits === 'years'
                ) {
                  let rangeInSeconds;
                  switch (this.data.xrangeunits) {
                    case 'seconds':
                      rangeInSeconds = 1;
                      break;
                    case 'minutes':
                      rangeInSeconds = 60;
                      break;
                    case 'hours':
                      rangeInSeconds = 3600;
                      break;
                    case 'days':
                      rangeInSeconds = 86400;
                      break;
                    case 'months':
                      rangeInSeconds = 2628000;
                      break;
                    case 'years':
                      rangeInSeconds = 31556952;
                      break;
                  }

                  this.chartOpt.xScaleMax = new Date(data.payload.timestamp);
                  this.chartOpt.xScaleMin = new Date(
                      this.chartOpt.xScaleMax.getTime() - this.data.xrange * rangeInSeconds * 1000
                  );
                }

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
                this.updateGraphedResults([...this.graphedResults]);
            }
        }
    }

    private chartLabel(entry) {
        let label = this.labels[entry.topic] || entry.topic;
        if (entry.units) {
            label += ' (' + entry.units + ')';
        }
        return label;
    }

    private chartEntry(entry) {
        return {
            name: new Date(entry.timestamp),
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
        if (typeof label !== 'string') {
            // legend clicks return strings. series clicks return objects.
            return;
        }
        let legendLabel = $(".legend-label span[title='" + label + "']");
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
            legendLabel.addClass('dim');
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
            legendLabel.removeClass('dim');
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
        // this.data.xrangeunits = isNaN(value) ? value : parseFloat(value);
        this.refreshTime();
        this.setDirty();
    }

    setXRangeStartDate(value: any) {
      this.data.xrangeStartDate = new Date(value).toISOString().split('T')[0] + 'T00:00';
      this.refreshTime();
      this.setDirty();
    }
    
    setXRangeEndDate(value: any) {
      this.data.xrangeEndDate = new Date(value).toISOString().split('T')[0] + 'T23:59';
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
        this.topicForm.value.topicSubbed = this.topicForm.value.topic;
        if (!this.data.topics.find((t) => t.topicSubbed === this.topicForm.value.topicSubbed)) {
            this.data.topics = [...this.data.topics, this.topicForm.value];
            this.setDirty();
        }
    }

    removeTopic(topic) {
        this.data.topics = this.data.topics.filter((t) => {
            return t.label !== topic.label && t.topicSubbed !== topic.topicSubbed;
        });
        this.setDirty();
    }

    addRefLine() {
        if (this.referenceLineForm.invalid) {
            return;
        }
        if (!this.data.referenceLines.find((r) => r.value === this.referenceLineForm.value.value)) {
            this.data.referenceLines = [...this.data.referenceLines, this.referenceLineForm.value];
            this.setDirty();
        }
    }

    removeRefLine(line) {
        this.data.referenceLines = this.data.referenceLines.filter((r) => {
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
            cf.color1,
            cf.color2,
            cf.color3,
            cf.color4,
            cf.color5,
            cf.color6,
            cf.color7,
            cf.color8,
            cf.color9,
            cf.color10,
            cf.color11,
            cf.color12,
        ];
        this.chartOpt.colorScheme.domain = this.data.colors;
        this.setDirty();
    }

    deploy() {
        const baseNodeId = this.getBaseNodeId(this.data.id);
        const nodesToReplace = [baseNodeId];
        this.red
            .deployNodes(nodesToReplace, (existing) => {
                switch (existing.id) {
                    case baseNodeId:
                        existing.chartType = this.data.chartType;
                        existing.topics = this.data.topics;
                        existing.xrange = this.data.xrange;
                        existing.xrangeunits = this.data.xrangeunits;
                        existing.xrangeStartDate = this.data.xrangeStartDate;
                        existing.xrangeEndDate = this.data.xrangeEndDate;
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
            point: 'Chart',
        });
    }

    // written to convert UTC to local time and convert date into format used in flows.json
    dateConvert (originalDate) {
        let dateStr = new Date(originalDate);
        dateStr.setHours(dateStr.getHours() - (dateStr.getTimezoneOffset() / 60), dateStr.getMinutes())
        return JSON.stringify(dateStr).slice(1, -9);
    }
}
