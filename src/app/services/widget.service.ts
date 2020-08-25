import { Injectable } from '@angular/core';
import { groupWidgets } from '../dashboard/group/group-widget';
import { UrTextComponent } from '../node-templates/ur-text/ur-text.component';
import { UrButtonComponent } from '../node-templates/ur-button/ur-button.component';
import { UrTextInputComponent } from '../node-templates/ur-text-input/ur-text-input.component';
import { UrTemplateComponent } from '../node-templates/ur-template/ur-template.component';
import { UrAnimationComponent } from '../node-templates/ur-animation/ur-animation.component';
import { UrScheduleComponent } from '../node-templates/ur-schedule/ur-schedule.component';

@Injectable({
    providedIn: 'root',
})
export class WidgetService {
    getWidgets(widgetsList: any[]) {
        return widgetsList.map((widget) => {
            switch (widget.type) {
                case 'text':
                    return new groupWidgets(UrTextComponent, widget);
                case 'button':
                    return new groupWidgets(UrButtonComponent, widget);
                case 'text-input':
                    return new groupWidgets(UrTextInputComponent, widget);
                case 'template':
                    return new groupWidgets(UrTemplateComponent, widget);
                case 'animation':
                    return new groupWidgets(UrAnimationComponent, widget);
                case 'schedule':
                    return new groupWidgets(UrScheduleComponent, widget);
                }
        });
    }
}
