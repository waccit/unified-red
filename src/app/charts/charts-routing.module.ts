import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { MorrisComponent } from './morris/morris.component';
// import { ChartjsComponent } from './chartjs/chartjs.component';
// import { SparklineComponent } from './sparkline/sparkline.component';
// import { EchartComponent } from './echart/echart.component';
// import { ApexchartComponent } from './apexchart/apexchart.component';
import { NgxchartComponent } from './ngxchart/ngxchart.component';
import { GaugeComponent } from './gauge/gauge.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'ngx-charts',
        pathMatch: 'full',
    },
    // {
    //   path: 'morris',
    //   component: MorrisComponent
    // },
    // {
    //   path: 'echart',
    //   component: EchartComponent
    // },
    // {
    //   path: 'apex',
    //   component: ApexchartComponent
    // },
    // {
    //   path: 'chartjs',
    //   component: ChartjsComponent
    // },
    {
        path: 'ngx-charts',
        component: NgxchartComponent,
    },
    {
        path: 'gauge',
        component: GaugeComponent,
    },
    // {
    //   path: 'sparkline',
    //   component: SparklineComponent
    // }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ChartsRoutingModule {}
