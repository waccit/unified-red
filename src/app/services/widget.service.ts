import { Injectable } from '@angular/core';
import { groupWidgets } from '../dashboard/group/group-widget';
import { UrTextComponent } from '../node-templates/ur-text/ur-text.component';
import { UrButtonComponent } from '../node-templates/ur-button/ur-button.component';
import { UrTextInputComponent } from '../node-templates/ur-text-input/ur-text-input.component';
import { UrTemplateComponent } from '../node-templates/ur-template/ur-template.component';
import { UrAnimationComponent } from '../node-templates/ur-animation/ur-animation.component';

@Injectable({
    providedIn: 'root',
})
export class WidgetService {
    getWidgets(widgetsList: any[]) {
        return widgetsList.map((widget) => {
            switch (widget.type) {
                case 'text':
                    return new groupWidgets(UrTextComponent, null, widget);
                case 'button':
                    return new groupWidgets(UrButtonComponent, 'UR-BUTTON', widget);
                case 'text-input':
                    return new groupWidgets(UrTextInputComponent, 'UR-TEXT-INPUT', widget);
                case 'template':
                    return new groupWidgets(UrTemplateComponent, 'UR-TEMPLATE', widget);
                case 'animation':
                    return new groupWidgets(UrAnimationComponent, 'UR-ANIMATION', widget);
            }
        });
    }
}
