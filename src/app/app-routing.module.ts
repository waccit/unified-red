import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './authentication/auth.guard';
import { DemoComponent } from './dashboard/demo/demo.component';
import { LoginComponent } from './authentication/login/login.component';
import { RegisterComponent } from './authentication/register/register.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { ProfileComponent } from './users/profile/profile.component';

const routes: Routes = [
    {
        path: '',
        component: DemoComponent,
        pathMatch: 'full',
        canActivate: [AuthGuard],
    },
    {
        path: 'users/profile',
        component: ProfileComponent,
        canActivate: [AuthGuard],
    },
    // {
    //     path: 'dashboard',
    //     loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
    // },
    // {
    //     path: 'dashboard',
    //     redirectTo: 'dashboard/main',
    //     pathMatch: 'full'
    // },
    // {
    //     path: 'dashboard/main',
    //     component: MainComponent
    // },
    // { //TODO: review
    //     path: 'apps',
    //     loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule)
    // },
    // { //TODO: review
    //     path: 'widget',
    //     loadChildren: () => import('./widget/widget.module').then(m => m.WidgetModule)
    // },
    // { //TODO: review
    //     path: 'ui',
    //     loadChildren: () => import('./ui/ui.module').then(m => m.UiModule)
    // },
    // { //TODO: review
    //     path: 'forms',
    //     loadChildren: () => import('./forms/forms.module').then(m => m.FormModule)
    // },
    // { //TODO: review
    //     path: 'tables',
    //     loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule)
    // },
    // { //TODO: review
    //     path: 'charts',
    //     loadChildren: () => import('./charts/charts.module').then(m => m.ChartsModule)
    // },
    // { //TODO: possibly for audit log
    //     path: 'timeline',
    //     loadChildren: () => import('./timeline/timeline.module').then(m => m.TimelineModule)
    // },
    // { //TODO: review
    //     path: 'icons',
    //     loadChildren: () => import('./icons/icons.module').then(m => m.IconsModule)
    // },
    {
        path: 'authentication/login',
        component: LoginComponent,
    },
    {
        path: 'authentication/register',
        component: RegisterComponent,
    },
    {
        path: 'authentication/forgot-password',
        component: ForgotPasswordComponent,
    },
    {
        path: 'authentication/reset-password/:resetToken',
        component: ResetPasswordComponent,
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
