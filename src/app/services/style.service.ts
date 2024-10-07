import { Injectable, Renderer2 } from '@angular/core';
import { render } from '@fullcalendar/common';

@Injectable({
    providedIn: 'root',
})
export class StyleService {
    private style: object = {};
    private renderer: Renderer2;
    constructor() {}

    getStyle(data: any, topic?: any) {
        if (topic) {
            return this.style?.[data.id]?.[topic]?.['css'];
        } else {
            return this.style?.[data.id]?.['css'];
        }
    }

    setStyle(data: any, pointName?: any) {
        if (data.msg.payload.health !== 'down') {
            if (this.style === null) {
                this.style = {};
            }
            if (!(data.id in this.style)) {
                this.style[data.id] = {};
            }
            if (pointName) {
                if (!(pointName in this.style[data.id])) {
                    this.style[data.id][pointName] = {};
                }
                this.style[data.id][pointName]['css'] = data.msg.payload.css;
            } else {
                this.style[data.id]['css'] = data.msg.payload.css;
            }
        }
    }

    getClass(data: any, topic?: any) {
        if (topic) {
            return this.style?.[data.id]?.[topic]?.['class'];
        } else {
            return this.style?.[data.id]?.['class'];
        }
    }

    setClass(data: any, pointName?: any) {
        if (this.style === null) {
            this.style = {};
        }
        if (!(data.id in this.style)) {
            this.style[data.id] = {};
        }
        if (data.msg.payload.health === 'down') {
            if (pointName) {
                if (!(pointName in this.style[data.id])) {
                    this.style[data.id][pointName] = {};
                }
                this.style[data.id][pointName]['class'] = 'health-down';
            }
            this.style[data.id]['class'] = 'health-down';
        } else {
            if (pointName) {
                if (!(pointName in this.style[data.id])) {
                    this.style[data.id][pointName] = {};
                }
                this.style[data.id][pointName]['class'] = data.msg.payload['class'];
            } else {
                this.style[data.id]['class'] = data.msg.payload['class'];
            }
        }
    }
}
