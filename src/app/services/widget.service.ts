import { Injectable } from '@angular/core';
import { groupWidget } from '../dashboard/group/group-widget';
import { UrTextComponent } from '../node-templates/ur-text/ur-text.component';
import { UrButtonComponent } from '../node-templates/ur-button/ur-button.component';

@Injectable({
    providedIn: 'root',
})
export class WidgetService {
    getWidgets(widgetsList: any[]) {
        return widgetsList.map((widget) => {
            switch (widget) {
                case 'ur_text':
                    return new groupWidget(UrTextComponent, 'UR-TEXT');
                case 'ur_button':
                    return new groupWidget(UrButtonComponent, 'UR-BUTTON');
            }
        });
    }
}
