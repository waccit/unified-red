import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { GroupComponent } from './group/group.component';
import { GroupDirective } from '../directives/group.directive';
import { PageComponent } from './page/page.component';
import { PageDirective } from '../directives/page.directive';
import { HomePageComponent } from './home-page/home-page.component';
import { AlarmConsoleComponent } from './alarm-console/alarm-console.component';
import { AlarmDialogComponent } from './alarm-console/alarm-dialog.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TabComponent } from './tab/tab.component';
import { MatTabsModule } from '@angular/material/tabs';
import { TabDirective } from '../directives/tab.directive';
import { AuditLogComponent } from './audit-log/audit-log.component';

@NgModule({
    declarations: [
        TabComponent,
        TabDirective,
        GroupComponent,
        GroupDirective,
        PageDirective,
        PageComponent,
        HomePageComponent,
        AlarmConsoleComponent,
        AlarmDialogComponent,
        AuditLogComponent,
    ],
    imports: [
        CommonModule,
        DashboardRoutingModule,
        FullCalendarModule,
        PerfectScrollbarModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatIconModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatPaginatorModule,
        MatTableModule,
        MatSortModule,
        MatTabsModule,
    ],
    entryComponents: [GroupComponent],
})
export class DashboardModule {}
