import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './authentication/auth.guard';
import { Page404Component } from './authentication/page404/page404.component';
import { HomePageComponent } from './dashboard/home-page/home-page.component';
import { InitialSetupComponent } from './initial-setup/initial-setup.component';

const routes: Routes = [
    {
        path: '',
        component: HomePageComponent,
        pathMatch: 'full',
        canActivate: [AuthGuard],
    },
    {
        path: 'initial-setup',
        component: InitialSetupComponent,
        pathMatch: 'full'
    },
    {
        path: '404',
        component: Page404Component,
    },
    // otherwise page not found
    {
        path: '**',
        component: Page404Component,
        // redirectTo: ''
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
