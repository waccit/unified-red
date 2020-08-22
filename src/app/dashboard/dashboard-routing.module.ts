import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuPageComponent } from './menu-page/menu-page.component';
import { AuthGuard } from '../authentication/auth.guard';

const routes: Routes = [
    {
        path: 'd',
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                // TODO add home page component
                // component: HomePageComponent,
                pathMatch: 'full',
            },
            {
                path: ':menuItem/:menuPage',
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
