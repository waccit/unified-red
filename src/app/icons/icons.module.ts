import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IconsRoutingModule } from './icons-routing.module';
import { MaterialComponent } from './material/material.component';
import { FontAwesomeComponent } from './font-awesome/font-awesome.component';
import { SimpleLineComponent } from './simple-line/simple-line.component';
import { ThemifyComponent } from './themify/themify.component';

@NgModule({
  declarations: [
    MaterialComponent,
    FontAwesomeComponent,
    SimpleLineComponent,
    ThemifyComponent
  ],
  imports: [CommonModule, IconsRoutingModule]
})
export class IconsModule {}
