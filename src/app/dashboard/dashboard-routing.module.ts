import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageComponent } from './page/page.component';
import { AuthGuard } from '../authentication/auth.guard';
import { HomePageComponent } from './home-page/home-page.component';
import { Role } from '../data';
import { AlarmConsoleComponent } from './alarm-console/alarm-console.component';

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
                component: PageComponent,
            },
        ],
    },
    {
        path: 'alarm-console',
        component: AlarmConsoleComponent,
        canActivate: [AuthGuard],
        data: { roles: Role.Level1 },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DashboardRoutingModule {}
