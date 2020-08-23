import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
// import { MainComponent } from './main/main.component';
// import { Dashboard2Component } from './dashboard2/dashboard2.component';
// import { Dashboard3Component } from './dashboard3/dashboard3.component';
// import { ChartsModule as chartjsModule } from 'ng2-charts';
// import { NgxEchartsModule } from 'ngx-echarts';
import { FullCalendarModule } from '@fullcalendar/angular';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
// import { NgApexchartsModule } from 'ng-apexcharts';
import { DemoComponent } from './demo/demo.component';
import { GroupComponent } from './group/group.component';
import { GroupDirective } from '../directives/group.directive';
import { MenuPageComponent } from './menu-page/menu-page.component';
import { MenuPageDirective } from '../directives/menu-page.directive';
import { HomePageComponent } from './home-page/home-page.component';

@NgModule({
    declarations: [
        // MainComponent,
        // Dashboard2Component,
        // Dashboard3Component,
        DemoComponent,
        GroupComponent,
        GroupDirective,
        MenuPageDirective,
        MenuPageComponent,
        HomePageComponent,
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
    entryComponents: [GroupComponent],
})
export class DashboardModule {}
