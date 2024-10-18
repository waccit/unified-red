import { Injectable, Renderer2 } from '@angular/core';
import { render } from '@fullcalendar/common';
import { ChangeDetectorRef } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class StyleService {
    private style: object = {};
    private renderer: Renderer2;
    //Classes set here below
    private classestoRemove = ['health-down', 'warning', 'info', 'disabled', 'success','danger']
    constructor() {
        cdRef: ChangeDetectorRef;
    }

    resetStyles() {
        this.style = {};
    }

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
            } else {
                this.style[data.id]['class'] = 'health-down';
            }
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

    applyStyles(element: HTMLElement, data: any, renderer: Renderer2, cdRef: ChangeDetectorRef) {
        const styles = this.getStyle(data);
        const backgroundColor = styles?.['background-color'] || null;
        const color = styles?.['color'] || null;

        let currentElement = element;
        let matFormFieldFlex: HTMLElement | null = null;

        // Traverse up the tree to find the nearest div with the class "mat-form-field-flex"
        while (currentElement.parentElement) {
            currentElement = currentElement.parentElement;
            if (currentElement.classList.contains('mat-form-field-flex')) {
                matFormFieldFlex = currentElement;
                break;
            }
        }

        if (matFormFieldFlex) {
            const outlineElements = matFormFieldFlex.querySelectorAll(
                '.mat-form-field-outline, .mat-form-field-outline-thick'
            );

            outlineElements.forEach((outlineElement) => {
                const classList = Array.from(outlineElement.classList);
                classList.forEach((className) => {
                    if (this.classestoRemove.includes(className)) {
                        renderer.removeClass(outlineElement, className);
                        renderer.removeClass(element, className);
                    }
                });

                renderer.removeStyle(outlineElement, 'background-color');
                renderer.removeStyle(element, 'background-color');
                renderer.removeStyle(element, 'color');

                renderer.setStyle(element, 'color', color);
                renderer.setStyle(element, 'background-color', backgroundColor);
                renderer.setStyle(outlineElement, 'background-color', backgroundColor);

                cdRef.detectChanges();
            });
        }
    }

    applyClass(element: HTMLElement, className: string, renderer: Renderer2, cdRef: ChangeDetectorRef) {
        let currentElement = element;
        let matFormFieldFlex: HTMLElement | null = null;

        while (currentElement.parentElement) {
            currentElement = currentElement.parentElement;
            if (currentElement.classList.contains('mat-form-field-flex')) {
                matFormFieldFlex = currentElement;
                break;
            }
        }

        if (matFormFieldFlex) {
            const outlineElements = matFormFieldFlex.querySelectorAll(
                '.mat-form-field-outline, .mat-form-field-outline-thick'
            );
            outlineElements.forEach((outlineElement) => {
                const classList = Array.from(outlineElement.classList);

                classList.forEach((className) => {
                    if (this.classestoRemove.includes(className)) {
                        renderer.removeClass(outlineElement, className);
                        renderer.removeClass(element, className);
                    }
                });
                renderer.setStyle(element, 'color', 'white');
                renderer.addClass(element, className);
                renderer.addClass(outlineElement, className);
                cdRef.detectChanges();
            });
        }
    }

    applyHealthDown(element: HTMLElement, renderer: Renderer2, cdRef: ChangeDetectorRef) {
        let currentElement = element;
        let matFormFieldFlex: HTMLElement | null = null;

        while (currentElement.parentElement) {
            currentElement = currentElement.parentElement;
            if (currentElement.classList.contains('mat-form-field-flex')) {
                matFormFieldFlex = currentElement;
                break;
            }
        }

        if (matFormFieldFlex) {
            const outlineElements = matFormFieldFlex.querySelectorAll(
                '.mat-form-field-outline, .mat-form-field-outline-thick'
            );

            outlineElements.forEach((outlineElement) => {
                const classList = Array.from(outlineElement.classList);
                classList.forEach((className) => {
                    if (this.classestoRemove.includes(className)) {
                        renderer.removeClass(outlineElement, className);
                        renderer.removeClass(element, className);
                    }
                });

                renderer.removeStyle(element, 'background-color');
                renderer.removeStyle(outlineElement, 'background-color');
                renderer.removeStyle(element, 'color');

                renderer.addClass(element, 'health-down');
                renderer.addClass(outlineElement, 'health-down');
                cdRef.detectChanges();
            });
        }
    }
}
