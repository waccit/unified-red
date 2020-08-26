import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { FullCalendarModule } from '@fullcalendar/angular';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { UrTextComponent } from './ur-text/ur-text.component';
import { UrButtonComponent } from './ur-button/ur-button.component';
import { UrTextInputComponent } from './ur-text-input/ur-text-input.component';
import { UrTemplateComponent } from './ur-template/ur-template.component';
import { UrAnimationComponent } from './ur-animation/ur-animation.component';
import { UrScheduleComponent } from './ur-schedule/ur-schedule.component';
import { UrScheduleFormDialogComponent } from './ur-schedule/ur-schedule-form-dialog.component';

@NgModule({
    declarations: [
        UrTextComponent,
        UrButtonComponent,
        UrTextInputComponent,
        UrTemplateComponent,
        UrAnimationComponent,
        UrScheduleComponent,
        UrScheduleFormDialogComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatMenuModule,
        MatDialogModule,
        MatSelectModule,
        MatDatepickerModule,
        MatRadioModule,
        MatSlideToggleModule,
        MatSidenavModule,
        FullCalendarModule,
        PerfectScrollbarModule,
        DragDropModule,
    ],
})
export class NodeTemplatesModule {}
