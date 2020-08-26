import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuPageComponent } from './menu-page/menu-page.component';
import { AuthGuard } from '../authentication/auth.guard';
import { HomePageComponent } from './home-page/home-page.component';

const routes: Routes = [
    {
        path: 'd',
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                component: HomePageComponent,
                pathMatch: 'full',
            },
            {
                path: '**',
                component: MenuPageComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DashboardRoutingModule {}
