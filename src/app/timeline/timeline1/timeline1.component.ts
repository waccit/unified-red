import { Component, OnInit } from '@angular/core';
import { DynamicScriptLoaderService } from './../../services/dynamic-script-loader.service';

@Component({
  selector: 'app-timeline1',
  templateUrl: './timeline1.component.html',
  styleUrls: ['./timeline1.component.scss']
})
export class Timeline1Component implements OnInit {
  constructor(private dynamicScriptLoader: DynamicScriptLoaderService) {}

  ngOnInit() {
    this.startScript();
  }
  async startScript() {
    await this.dynamicScriptLoader
      .load('googleapi')
      .then(data => {
        this.loadData();
      })
      .catch(error => console.log(error));
  }

  private loadData() {}
}
