import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { TemplateComponent } from './template/template.component';
import { MenuPageComponent } from './menu-page/menu-page.component';

const routes: Routes = [
    {
        path: 'dashboard',
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
                path: 'menu-page/:pageTitle',
                component: MenuPageComponent,
            },
            {
                path: 'Template',
                component: TemplateComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class DashboardRoutingModule {}
