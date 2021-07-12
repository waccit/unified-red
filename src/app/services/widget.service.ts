import { Injectable } from '@angular/core';
import { Widget } from '../data/widget.model';
import { UrTextComponent } from '../node-templates/ur-text/ur-text.component';
import { UrButtonComponent } from '../node-templates/ur-button/ur-button.component';
import { UrTextInputComponent } from '../node-templates/ur-text-input/ur-text-input.component';
import { UrTemplateComponent } from '../node-templates/ur-template/ur-template.component';
import { UrAnimationComponent } from '../node-templates/ur-animation/ur-animation.component';
import { UrScheduleComponent } from '../node-templates/ur-schedule/ur-schedule.component';
import { UrTableComponent } from '../node-templates/ur-table/ur-table.component';
import { UrFormComponent } from '../node-templates/ur-form/ur-form.component';
import { UrChartComponent } from '../node-templates/ur-chart/ur-chart.component';
import { UrGaugeComponent } from '../node-templates/ur-gauge/ur-gauge.component';

@Injectable({
    providedIn: 'root',
})
export class WidgetService {
    getWidgets(widgets: any[]) {
        return widgets.map((widget) => {
            switch (widget.type) {
                case 'text':
                    return new Widget(UrTextComponent, widget);
                case 'button':
                    return new Widget(UrButtonComponent, widget);
                case 'chart':
                    return new Widget(UrChartComponent, widget);
                case 'gauge':
                    return new Widget(UrGaugeComponent, widget);
                case 'text-input':
                    return new Widget(UrTextInputComponent, widget);
                case 'template':
                    return new Widget(UrTemplateComponent, widget);
                case 'animation':
                    return new Widget(UrAnimationComponent, widget);
                case 'schedule':
                    return new Widget(UrScheduleComponent, widget);
                case 'table':
                    return new Widget(UrTableComponent, widget);
                case 'form':
                    return new Widget(UrFormComponent, widget);
            }
        });
    }
}
