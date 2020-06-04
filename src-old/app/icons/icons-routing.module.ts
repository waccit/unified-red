import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MaterialComponent } from './material/material.component';
import { FontAwesomeComponent } from './font-awesome/font-awesome.component';
import { SimpleLineComponent } from './simple-line/simple-line.component';
import { ThemifyComponent } from './themify/themify.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'material',
        pathMatch: 'full',
    },
    {
        path: 'material',
        component: MaterialComponent,
    },
    {
        path: 'font-awesome',
        component: FontAwesomeComponent,
    },
    {
        path: 'simple-line',
        component: SimpleLineComponent,
    },
    {
        path: 'themify',
        component: ThemifyComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class IconsRoutingModule {}
