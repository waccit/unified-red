import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { Dashboard2Component } from './dashboard2/dashboard2.component';
import { Dashboard3Component } from './dashboard3/dashboard3.component';
import { TemplateComponent } from './template/template.component';

import { DemoComponent } from './demo/demo.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: 'main',
    component: MainComponent
  },
  {
    path: 'demo',
    component: DemoComponent
  },
  {
    path: 'dashboard2',
    component: Dashboard2Component
  },
  {
    path: 'dashboard3',
    component: Dashboard3Component
  },
  {
    path: 'Template',
    component: TemplateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
