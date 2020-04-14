import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelineRoutingModule } from './timeline-routing.module';
import { Timeline1Component } from './timeline1/timeline1.component';
import { Timeline2Component } from './timeline2/timeline2.component';

@NgModule({
  declarations: [Timeline1Component, Timeline2Component],
  imports: [CommonModule, TimelineRoutingModule]
})
export class TimelineModule {}
