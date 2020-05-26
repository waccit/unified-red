import { Component, OnInit } from '@angular/core';
import { DynamicScriptLoaderService } from './../../services/dynamic-script-loader.service';

declare const $: any;
@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
  constructor(private dynamicScriptLoader: DynamicScriptLoaderService) {}

  ngOnInit() {
    this.startScript();
  }

  async startScript() {
    await this.dynamicScriptLoader
      .load('lightgallery')
      .then(data => {
        this.loadData();
      })
      .catch(error => console.log(error));
  }

  private loadData() {
    $('#aniimated-thumbnials').lightGallery({
      thumbnail: true,
      selector: 'a'
    });
  }
}
