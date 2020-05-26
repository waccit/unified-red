import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './authentication/auth.guard';
import { DemoComponent } from './dashboard/demo/demo.component';
import { SigninComponent } from './authentication/signin/signin.component';
import { SignupComponent } from './authentication/signup/signup.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';

const routes: Routes = [
    {
        path: '',
        component: DemoComponent,
        pathMatch: 'full',
        canActivate: [AuthGuard]
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
    // { //TODO: remove
    //     path: 'email',
    //     loadChildren: () => import('./email/email.module').then(m => m.EmailModule)
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
    // { //TODO: remove
    //     path: 'media',
    //     loadChildren: () => import('./media/media.module').then(m => m.MediaModule)
    // },
    // { //TODO: review
    //     path: 'charts',
    //     loadChildren: () => import('./charts/charts.module').then(m => m.ChartsModule)
    // },
    // { //TODO: remove
    //     path: 'timeline',
    //     loadChildren: () => import('./timeline/timeline.module').then(m => m.TimelineModule)
    // },
    // { //TODO: review
    //     path: 'icons',
    //     loadChildren: () => import('./icons/icons.module').then(m => m.IconsModule)
    // },
    // {
    //     path: 'authentication',
    //     loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule)
    // },
    {
        path: 'authentication/login',
        component: SigninComponent
    },
    {
        path: 'authentication/register',
        component: SignupComponent
    },
    {
        path: 'authentication/forgot-password',
        component: ForgotPasswordComponent
    },
    // { //TODO: review
    //     path: 'extra-pages',
    //     loadChildren: () => import('./extra-pages/extra-pages.module').then(m => m.ExtraPagesModule)
    // },
    // { //TODO: remove
    //     path: 'maps',
    //     loadChildren: () => import('./maps/maps.module').then(m => m.MapsModule)
    // },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
