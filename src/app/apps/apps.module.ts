import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragulaModule } from 'ng2-dragula';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FormsModule } from '@angular/forms';

import { AppsRoutingModule } from './apps-routing.module';
import { CalendarComponent } from './calendar/calendar.component';
// import { ChatComponent } from './chat/chat.component';
// import { DragDropComponent } from './drag-drop/drag-drop.component';
// import { ContactListComponent } from './contact-list/contact-list.component';
// import { ContactGridComponent } from './contact-grid/contact-grid.component';
// import { SupportComponent } from './support/support.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MatButtonModule } from '@angular/material/button';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [
    CalendarComponent,
    // ChatComponent,
    // DragDropComponent,
    // ContactListComponent,
    // ContactGridComponent,
    // SupportComponent
  ],
  imports: [
    CommonModule,
    AppsRoutingModule,
    FullCalendarModule,
    PerfectScrollbarModule,
    MatButtonModule,
    NgxDatatableModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatInputModule,
    FormsModule,
    DragulaModule.forRoot()
  ]
})
export class AppsModule {}
