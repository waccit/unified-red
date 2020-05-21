import { Component, OnInit } from "@angular/core";


import { WebSocketService } from '../../services/web-socket.service';
import { DynamicScriptLoaderService } from './../../services/dynamic-script-loader.service';

@Component({
    selector: 'app-template',
    templateUrl: './template.component.html',
    styleUrls: ['./template.component.scss']
})

export class TemplateComponent implements OnInit {
    constructor(private dynamicScriptLoader: DynamicScriptLoaderService, private webSocketService: WebSocketService) {}

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

        this.webSocketService.listen('ui-controls').subscribe( (data) => {
            console.log("WebSocketService connect data: ", data);
          });
      
          this.webSocketService.listen('update-value').subscribe( (data: any) => {
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