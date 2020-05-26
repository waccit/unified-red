import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapsRoutingModule } from './maps-routing.module';
import { GoogleComponent } from './google/google.component';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [GoogleComponent],
  imports: [CommonModule, MapsRoutingModule, AgmCoreModule]
})
export class MapsModule {}
