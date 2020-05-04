import { Component, OnInit } from "@angular/core";


import { SocketIoService } from './../../services/socket-io.service';
import { DynamicScriptLoaderService } from './../../services/dynamic-script-loader.service';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})

export class DemoComponent implements OnInit {
  constructor(private dynamicScriptLoader: DynamicScriptLoaderService, private socketIo: SocketIoService) {}

  text1: any = {
    id: '',
    value: ''
  };

  text2: any = {
    id: '',
    value: ''
  };

  ngOnInit() {
    'use strict';

    this.socketIo.connect( ui => {
      console.log(ui.site);
      console.log(ui.menu);
    }, () => {});

    this.socketIo.on('update-value', data => {
      console.log('update-value called: ', data);
      if (data.value.length > 3) {
        if (this.text1.id.length === 0 ) {
          this.text1.id = data.id;
          this.text1.value = data.value
        }

        this.text1.value = data.value;
      } else {
        if (this.text2.id.length === 0) {
          this.text2.id = data.id;
          this.text2.value = data.value
        }

        this.text2.value = data.value
      }
    });

  }
}