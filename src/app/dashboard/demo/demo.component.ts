import { Component, OnInit } from '@angular/core';

import { DynamicScriptLoaderService } from './../../services/dynamic-script-loader.service';
import { WebSocketService } from '../../services/web-socket.service';
import { groupWidget } from '../group/group-widget';
import { WidgetService } from '../../services/widget.service';

@Component({
    selector: 'app-demo',
    templateUrl: './demo.component.html',
    styleUrls: ['./demo.component.scss'],
})
export class DemoComponent implements OnInit {
    widgets: groupWidget[];

    constructor(
        private dynamicScriptLoader: DynamicScriptLoaderService,
        private webSocketService: WebSocketService,
        private widgetService: WidgetService
    ) {}

    text1: any = {
        id: '',
        value: '',
    };

    text2: any = {
        id: '',
        value: '',
    };

    ngOnInit() {
        'use strict';

        this.webSocketService.listen('update-value').subscribe((data: any) => {
            console.log('update-value called: ', data);
            if (data.value.length > 3) {
                if (this.text1.id.length === 0) {
                    this.text1.id = data.id;
                    this.text1.value = data.value;
                }

                this.text1.value = data.value;
            } else {
                if (this.text2.id.length === 0) {
                    this.text2.id = data.id;
                    this.text2.value = data.value;
                }

                this.text2.value = data.value;
            }
        });

        this.widgets = this.widgetService.getWidgets([
            'ur_button',
            'ur_text',
            'ur_button',
            'ur_button',
            'ur_text',
            'ur_button',
        ]);
    }
}
