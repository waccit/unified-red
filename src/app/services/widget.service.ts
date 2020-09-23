import { Injectable } from '@angular/core';
import { GroupWidgets } from '../dashboard/group/group-widget';
import { UrTextComponent } from '../node-templates/ur-text/ur-text.component';
import { UrButtonComponent } from '../node-templates/ur-button/ur-button.component';
import { UrTextInputComponent } from '../node-templates/ur-text-input/ur-text-input.component';
import { UrTemplateComponent } from '../node-templates/ur-template/ur-template.component';
import { UrAnimationComponent } from '../node-templates/ur-animation/ur-animation.component';
import { UrScheduleComponent } from '../node-templates/ur-schedule/ur-schedule.component';
import { UrTableComponent } from '../node-templates/ur-table/ur-table.component';
import { UrFormComponent } from '../node-templates/ur-form/ur-form.component';

@Injectable({
    providedIn: 'root',
})
export class WidgetService {
    getWidgets(widgetsList: any[]) {
        return widgetsList.map((widget) => {
            switch (widget.type) {
                case 'text':
                    return new GroupWidgets(UrTextComponent, widget);
                case 'button':
                    return new GroupWidgets(UrButtonComponent, widget);
                case 'text-input':
                    return new GroupWidgets(UrTextInputComponent, widget);
                case 'template':
                    return new GroupWidgets(UrTemplateComponent, widget);
                case 'animation':
                    return new GroupWidgets(UrAnimationComponent, widget);
                case 'schedule':
                    return new GroupWidgets(UrScheduleComponent, widget);
                case 'table':
                    return new GroupWidgets(UrTableComponent, widget);
                case 'form':
                    return new GroupWidgets(UrFormComponent, widget);
            }
        });
    }
}
