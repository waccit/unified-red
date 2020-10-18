import { Component, OnInit } from '@angular/core';
import { CurrentUserService, NodeRedApiService, RoleService, SnackbarService, WebSocketService } from '../../services';
import { BrowserModule } from '@angular/platform-browser';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BaseNode } from '../ur-base-node';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { reduce } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';

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
    topics: {alias: string, def: string};
}

@Component({
    selector: 'app-ur-chart',
    templateUrl: './ur-chart.component.html',
    styleUrls: ['./ur-chart.component.sass']
})

export class UrChartComponent extends BaseNode implements OnInit {
    selectedUnit: string;
  
    units: Unit[] = [
        {value: '1', viewValue: 'sec'},
        {value: '60', viewValue: 'min'},
        {value: '3600', viewValue: 'hr'},
        {value: '86400', viewValue: 'day(s)'},
        {value: '2592000', viewValue: 'month(s)'},
        {value: '31104000', viewValue: 'year(s)'}
    ];

    view: any[] = [700, 500];
    config: chartConfiguration;
    graph: any[];
    private _liveSub: Subscription;
    
    // options
    legend: boolean = true;
    showLabels: boolean = true;
    animations: boolean = true;
    xAxis: boolean = true;
    yAxis: boolean = true;
    showYAxisLabel: boolean = false;
    showXAxisLabel: boolean = true;
    xAxisLabel: string = '';
    yAxisLabel: string = '';
    timeline: boolean = false;
    xScaleMin: any;
    xScaleMax: any;
    yScaleMin: number;
    yScaleMax: number;

    colorScheme = {
        domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
    };
    dataLog: any;
    values: any;
    param: any;

    topics:Array<string>=[];
    alias:Array<string>=[];
    currentTime: Date;
    timeValue: any;

    constructor(
        protected webSocketService: WebSocketService,
        protected currentUserService: CurrentUserService,
        protected roleService: RoleService,
        protected snackbar: SnackbarService,
        public dialog: MatDialog,
        private red: NodeRedApiService,
        public http: HttpClient,
    ) {
        super(webSocketService, currentUserService, roleService, snackbar);
    }

    ngOnDestroy(): void{
        if (this._liveSub) {
            this._liveSub.unsubscribe();
        }
    }

    ngOnInit(): void {
        this.config = this.data;
        this.timeValue = this.config.xrange;
        
        for (const topic in this.config.topics) {
            this.topics.push(this.config.topics[topic].def);
            this.alias.push(this.config.topics[topic].alias);
        }
        this.selectedUnit = this.config.xrangeunits;
        this.graphChart({checked: this.config.live});
    }

    startTimeValue(event: any) {
        this.timeValue = event.target.value;
        let startTime = new Date(this.currentTime.getTime()-parseFloat(event.target.value)*parseFloat(this.selectedUnit)*1000);
        this.param.startTimestamp = startTime;
        this.getData(this.param, this.topics, this.alias);
    }
    startTimeUnits(event: any) {
        let startTime = new Date(this.currentTime.getTime()-parseFloat(this.timeValue)*parseFloat(this.selectedUnit)*1000);
        this.param.startTimestamp = startTime;
        this.getData(this.param, this.topics, this.alias);
    }

    endTime(event: any) {

        this.param.endTimestamp = event.target.value;
        this.getData(this.param, this.topics, this.alias);
    }

    graphChart(event: any) { // 
        this.currentTime = new Date();
        let startTime = new Date(this.currentTime.getTime()-parseFloat(this.config.xrange)*parseFloat(this.config.xrangeunits)*1000);
        this.param = {
            "topic": this.topics,  //['some/sensor/a','some/sensor/b'],
            startTimestamp: startTime,
            endTimestamp: this.currentTime,
            // value: any,
            lowValue: parseFloat(this.config.ymin),
            highValue: parseFloat(this.config.ymax),
            // status: string,
            // tags: string[]
        }
        this.yScaleMin = this.param.lowValue;
        this.yScaleMax = this.param.highValue;
        this.getData(this.param, this.topics, this.alias);
        if(event.checked){
            this._liveSub = this.webSocketService.listen('ur-datalog-update').subscribe((msg: any) => {
                this.liveData(msg, this.param, this.topics, this.alias);
            });
        }else{
            if (this._liveSub) {
                this._liveSub.unsubscribe();
            }
        }
    }

    getData(param:any, topics:any, alias:any){
        this.http.put('/api/datalog/',param)
            .pipe()
            .subscribe(
                (data) => {
                    this.dataLog = data;
                    this.formatData(topics, alias);
                },
                (error) => {
                    this.snackbar.error(error);
                }
            );
    };

    liveData(data:any, param:any, topics:any, alias:any){
        console.log("timestamp", data.payload.timestamp);
        this.xScaleMax = new Date(data.payload.timestamp);
        this.xScaleMin = new Date(this.xScaleMax.getTime()-parseFloat(this.config.xrange)*parseFloat(this.config.xrangeunits)*1000);
        // this.getData(param, topics, alias);
        this.dataLog.push({
            value: data.payload.value,
            timestamp: data.payload.timestamp,
            topic: data.payload.topic,
            units: data.payload.units
        });
        this.formatData(topics, alias);
    };

    formatData(topics:any, alias:any){
        let seriesName;
        let reduced = this.dataLog.reduce((out, entry) => {
            if(topics.indexOf(entry.topic) >= 0  &&  alias[topics.indexOf(entry.topic)] !== ''){
                seriesName = alias[topics.indexOf(entry.topic)];
            }else{
                seriesName = entry.topic;
            }
            if (out.hasOwnProperty(entry.topic)) {
                out[entry.topic].series.push({ name: new Date(entry.timestamp), value: entry.value });
            }
            else {
                out[entry.topic] = { name: seriesName, series: [{ name: new Date(entry.timestamp), value: entry.value }] };
            }
            return out;
        }, {});
        
        let out = [];
        for (let topic in reduced) {
            out.push(reduced[topic]);
        }
        this.graph = out;
    }

    onSelect(data): void {
        console.log('Item clicked', JSON.parse(JSON.stringify(data)));
    }

    onActivate(data): void {
        console.log('Activate', JSON.parse(JSON.stringify(data)));
    }

    onDeactivate(data): void {
        console.log('Deactivate', JSON.parse(JSON.stringify(data)));
    }
    updateValue(data: any) {
        super.updateValue(data);
    }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.setupDatapointAccess();
    }

}
