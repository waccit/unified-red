import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { MainComponent } from './main/main.component';
// import { Dashboard2Component } from './dashboard2/dashboard2.component';
// import { Dashboard3Component } from './dashboard3/dashboard3.component';
// import { ChartsModule as chartjsModule } from 'ng2-charts';
// import { NgxEchartsModule } from 'ngx-echarts';
import { FullCalendarModule } from '@fullcalendar/angular';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
// import { NgApexchartsModule } from 'ng-apexcharts';
import { DemoComponent } from './demo/demo.component';
import { UrTextComponent } from '../node-templates/ur-text/ur-text.component';
import { GroupComponent } from './group/group.component';

@NgModule({
    declarations: [
        MainComponent,
        // Dashboard2Component,
        // Dashboard3Component,
        DemoComponent,
        UrTextComponent,
        GroupComponent,
    ],
    imports: [
        CommonModule,
        DashboardRoutingModule,
        // chartjsModule,
        // NgxEchartsModule,
        FullCalendarModule,
        // NgApexchartsModule,
        PerfectScrollbarModule,
    ],
})
export class DashboardModule {}
