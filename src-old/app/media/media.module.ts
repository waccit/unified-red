import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MediaRoutingModule } from './media-routing.module';
import { CarouselComponent } from './carousel/carousel.component';
import { GalleryComponent } from './gallery/gallery.component';

@NgModule({
  declarations: [CarouselComponent, GalleryComponent],
  imports: [CommonModule, MediaRoutingModule]
})
export class MediaModule {}
