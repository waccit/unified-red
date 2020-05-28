import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChartsRoutingModule } from './charts-routing.module';
// import { EchartComponent } from './echart/echart.component';
// import { MorrisComponent } from './morris/morris.component';
// import { ChartjsComponent } from './chartjs/chartjs.component';
// import { SparklineComponent } from './sparkline/sparkline.component';
// import { ApexchartComponent } from './apexchart/apexchart.component';
// import { NgxEchartsModule } from 'ngx-echarts';
// import { ChartsModule as chartjsModule } from 'ng2-charts';
// import { MorrisJsModule } from 'angular-morris-js';
import { NgxchartComponent } from './ngxchart/ngxchart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
// import { NgApexchartsModule } from 'ng-apexcharts';
import { GaugeComponent } from './gauge/gauge.component';
import { GaugeModule } from 'angular-gauge';

@NgModule({
    declarations: [
        // EchartComponent,
        // MorrisComponent,
        // ChartjsComponent,
        // SparklineComponent,
        // ApexchartComponent,
        NgxchartComponent,
        GaugeComponent,
    ],
    imports: [
        CommonModule,
        ChartsRoutingModule,
        // NgxEchartsModule,
        // chartjsModule,
        // MorrisJsModule,
        NgxChartsModule,
        // NgApexchartsModule,
        GaugeModule.forRoot(),
    ],
})
export class ChartsModule {}
