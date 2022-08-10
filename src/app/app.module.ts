import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './layout/header/header.component';
import { PageLoaderComponent } from './layout/page-loader/page-loader.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { RightSidebarComponent } from './layout/right-sidebar/right-sidebar.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { RightSidebarService } from './services/rightsidebar.service';
import {
    PerfectScrollbarModule,
    PERFECT_SCROLLBAR_CONFIG,
    PerfectScrollbarConfigInterface,
} from 'ngx-perfect-scrollbar';
import { UsersModule } from './users/users.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { JwtInterceptor } from './authentication/jwt.interceptor';
import { ErrorInterceptor } from './authentication/error.interceptor';
import { Page500Component } from './authentication/page500/page500.component';
import { Page404Component } from './authentication/page404/page404.component';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMaskModule } from 'ngx-mask';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; //Added HttpClient
import { DashboardModule } from './dashboard/dashboard.module';
import { NgIdleModule } from '@ng-idle/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { MenuEntityComponent } from './layout/sidebar/menu-entity/menu-entity.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatStepperModule } from '@angular/material/stepper';
import { InitialSetupModule } from './initial-setup/initial-setup.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'; //Added DI
import { TranslateHttpLoader } from '@ngx-translate/http-loader'; //Added DI
import { MatSelectModule } from '@angular/material/select';


FullCalendarModule.registerPlugins([
    // register FullCalendar plugins
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin,
]);

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    suppressScrollX: true,
    wheelPropagation: false,
};

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        PageLoaderComponent,
        MenuEntityComponent,
        SidebarComponent,
        RightSidebarComponent,
        Page500Component,
        Page404Component,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        InitialSetupModule,
        AuthenticationModule,
        DashboardModule,
        UsersModule,
        AppRoutingModule,
        NgbModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule,
        PerfectScrollbarModule,
        MatIconModule,
        MatButtonModule,
        MatProgressBarModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatListModule,
        MatSidenavModule,
        MatSnackBarModule,
        MatStepperModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatMenuModule,
        NgxMaskModule.forRoot(),
        NgIdleModule.forRoot(),
        FullCalendarModule,
        NgxChartsModule,
		TranslateModule.forRoot({ loader: { provide: TranslateLoader, useFactory: httpTranslateLoader, deps: [HttpClient]}}), //Added DI
        MatSelectModule,
    ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
        },
        RightSidebarService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ],
    entryComponents: [],
    bootstrap: [AppComponent],
})
export class AppModule {}

export function httpTranslateLoader(http: HttpClient) { //Added DI
  return new TranslateHttpLoader(http);
}
