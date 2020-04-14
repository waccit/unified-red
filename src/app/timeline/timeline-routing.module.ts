import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Timeline1Component } from './timeline1/timeline1.component';
import { Timeline2Component } from './timeline2/timeline2.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'timeline1',
    pathMatch: 'full'
  },
  {
    path: 'timeline1',
    component: Timeline1Component
  },
  {
    path: 'timeline2',
    component: Timeline2Component
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimelineRoutingModule {}
