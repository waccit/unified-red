import { Component, OnInit } from '@angular/core';
import { CurrentUserService, NodeRedApiService, RoleService, SnackbarService, WebSocketService } from '../../services';
import { BrowserModule } from '@angular/platform-browser';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BaseNode } from '../ur-base-node';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { first, reduce } from 'rxjs/operators';
import { multi } from './data';


export interface chartConfiguration {
	xmax: string;
    xmin: string;
    topics: {alias: string, def: string};
}

@Component({
    selector: 'app-ur-chart',
    templateUrl: './ur-chart.component.html',
    styleUrls: ['./ur-chart.component.sass']
})

export class UrChartComponent extends BaseNode implements OnInit {

    view: any[] = [700, 300];
    config: chartConfiguration;
    multi: any[];
    
    // options
    legend: boolean = true;
    showLabels: boolean = true;
    animations: boolean = true;
    xAxis: boolean = true;
    yAxis: boolean = true;
    showYAxisLabel: boolean = true;
    showXAxisLabel: boolean = true;
    xAxisLabel: string = 'Year';
    yAxisLabel: string = 'Population';
    timeline: boolean = true;

    colorScheme = {
        domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
    };
    dataLog: any;


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
        // Object.assign(this, { multi });
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

    ngOnInit(): void {
        this.config = this.data;
        console.log('this.config.topics', this.config);
        const topics = [];
        for (const topic in this.config.topics) {
            topics.push(this.config.topics[topic].def);
        }
        console.log('topics', topics);
        
        let param = {
            "topic": topics,  //['some/sensor/a','some/sensor/b'],
            // "topic": 'some/sensor/a',
            // startTimestamp: new Date(this.data.xmin),
            // endTimestamp: new Date(this.data.xmax),
            // value: any,
            // lowValue: any,
            // highValue: any,
            // status: string,
            // tags: string[]
        }
        console.log('param', param);
        this.getData(param);
        

        // Object.assign(this, { multi });
    }

    getData(param:any){
        this.http.put('/api/datalog/',param)
            .pipe()
            .subscribe(
                (data) => {
                    console.log('data', data);
                    this.dataLog = data;
                    console.log('dataLog', this.dataLog);
                    const reduced = this.dataLog.reduce((out, entry) => {
                        if (out.hasOwnProperty(entry.topic)) {
                            out[entry.topic].series.push({ name: entry.timestamp, value: entry.value });
                        }
                        else {
                            out[entry.topic] = { name: entry.topic, series: [{ name: entry.timestamp, value: entry.value }] };
                        }
                        return out;
                    }, {});
                    
                    const out = [];
                    for (const topic in reduced) {
                        out.push(reduced[topic]);
                    }
                    console.log('out', out);
                    console.log('multi', multi);
                    this.multi = out;
                    console.log('this.multi', this.multi);
                    this.snackbar.success('Data Recieved!');
                },
                (error) => {
                    this.snackbar.error(error);
                }
            );
    };
    

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.setupDatapointAccess();
    }

}
