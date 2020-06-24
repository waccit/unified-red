import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { MenuPageComponent } from './menu-page/menu-page.component';

const routes: Routes = [
    {
        path: 'd',
        children: [
            {
                path: '',
                redirectTo: 'main',
                pathMatch: 'full',
            },
            {
                path: 'main',
                component: MainComponent,
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
