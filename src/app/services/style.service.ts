import { Injectable, Renderer2 } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class StyleService {
    private style: object = {};
    private appliedFieldClasses = new WeakMap<HTMLElement, string[]>();
    private appliedFieldStyles = new WeakMap<HTMLElement, string[]>();
    constructor() {}

    resetStyles() {
        this.style = {};
    }

    getStyle(data: any, topic?: any) {
        return topic ? this.style?.[data.id]?.[topic]?.css : this.style?.[data.id]?.default.css;
    }

    setStyle(data: any, pointName?: any) {
        if (data.msg.payload.health === 'down') return;
        this.style[data.id] = this.style[data.id] || { default: {} };
        if (pointName) {
            this.style[data.id][pointName] = this.style[data.id][pointName] || {};
            this.style[data.id][pointName].css = data.msg.payload.css;
        } else if (data.msg.topic) {
            this.style[data.id][data.msg.topic] = this.style[data.id][data.msg.topic] || {};
            this.style[data.id][data.msg.topic].css = data.msg.payload.css;
        }
        this.style[data.id].default.css = data.msg.payload.css;
    }

    getClass(data: any, topic?: any) {
        return topic ? this.style?.[data.id]?.[topic]?.class : this.style?.[data.id]?.default.class;
    }

    setClass(data: any, pointName?: any) {
        this.style[data.id] = this.style[data.id] || { default: {} };
        const className = data.msg.payload.health === 'down' ? 'health-down' : data.msg.payload.class;
        if (pointName) {
            this.style[data.id][pointName] = this.style[data.id][pointName] || {};
            this.style[data.id][pointName].class = className;
        } else if (data.msg.topic) {
            this.style[data.id][data.msg.topic] = this.style[data.id][data.msg.topic] || {};
            this.style[data.id][data.msg.topic].class = className;
        }
        this.style[data.id].default.class = className;
    }

    // Styles a Material form field (ur-text-input, ur-form) from msg.payload.health / class / css.
    // Material 15+ (MDC) renders the visible box as .mat-mdc-text-field-wrapper, so styles and
    // classes go on that wrapper; `color` is also pushed down to the control and label, which
    // set their own colors and would otherwise ignore it.
    applyFieldStyle(element: HTMLElement, payload: any, renderer: Renderer2) {
        if (!element) return;
        const wrapper = (element.closest('.mat-mdc-text-field-wrapper') as HTMLElement) || element;

        // Clear whatever the previous message applied
        for (const className of this.appliedFieldClasses.get(wrapper) || []) {
            renderer.removeClass(wrapper, className);
        }
        for (const prop of this.appliedFieldStyles.get(wrapper) || []) {
            renderer.removeStyle(wrapper, prop);
        }
        this.appliedFieldClasses.delete(wrapper);
        this.appliedFieldStyles.delete(wrapper);

        const classes: string[] = [];
        if (payload?.health === 'down') {
            classes.push('health-down');
        } else if (payload?.class) {
            classes.push(...String(payload.class).split(/\s+/).filter(Boolean));
        } else if (payload?.css && typeof payload.css === 'object') {
            const props = Object.keys(payload.css);
            for (const prop of props) {
                renderer.setStyle(wrapper, prop, payload.css[prop]);
            }
            this.appliedFieldStyles.set(wrapper, props);
            if (payload.css['color']) {
                classes.push('ur-field-color');
            }
        }

        for (const className of classes) {
            renderer.addClass(wrapper, className);
        }
        if (classes.length) {
            this.appliedFieldClasses.set(wrapper, classes);
        }
    }
}
