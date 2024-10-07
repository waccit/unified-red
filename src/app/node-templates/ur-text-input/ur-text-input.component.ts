import { Component, AfterViewInit, ElementRef, Renderer2, ViewChild, RendererStyleFlags2, ChangeDetectorRef } from '@angular/core';
import { BaseNode } from '../ur-base-node';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { WebSocketService, SnackbarService, CurrentUserService, RoleService } from '../../services';
import { StyleService } from '../../services/style.service';
import { render } from '@fullcalendar/common';
import { __classPrivateFieldSet } from 'tslib';

@Component({
    selector: 'app-ur-text-input',
    templateUrl: './ur-text-input.component.html',
    styleUrls: ['./ur-text-input.component.sass'],
})
export class UrTextInputComponent extends BaseNode implements AfterViewInit {
    label: string;
    valueIn = '';
    valueSubject = new BehaviorSubject(this.valueIn);
    delay: number;

    @ViewChild('myInputarea') myInputarea!: ElementRef;

    constructor(
        protected renderer: Renderer2,
        private localStyleService: StyleService,
        websocketService: WebSocketService,
        snackbarService: SnackbarService,
        currentUserService: CurrentUserService,
        roleService: RoleService,
        protected cdRef: ChangeDetectorRef
    ) {
        super(websocketService, currentUserService, roleService, snackbarService, localStyleService, renderer);
    }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.setupDatapointAccess();
        this.label = this.data.label.includes('{{') ? '' : this.data.label;

        this.delay = parseInt(this.data.delay, 10);
        if (this.delay > 0) {
            this.valueSubject
                .asObservable()
                .pipe(debounceTime(this.delay), distinctUntilChanged())
                .subscribe(() => {
                    this.formatAndSend(this.data.topic, this.label, this.valueSubject.value);
                });
        }
        this.applyStylesToTree();
    }
    applyStylesToTree() {
        const inputarea = this.myInputarea.nativeElement;
        const styles = this.styleService.getStyle(this.data);
        const backgroundColor = styles?.['background-color'];

        // Traverse up the tree to find the nearest div with the class "mat-form-field-flex"
        let currentElement = inputarea;
        let matFormFieldFlex: HTMLElement | null = null;
        while (currentElement.parentElement) {
            currentElement = currentElement.parentElement;
            if (currentElement.classList.contains('mat-form-field-flex')) {
                matFormFieldFlex = currentElement;
                break;
            }
        }

        if (matFormFieldFlex) {
            // Traverse down to find children with the specified classes
            const outlineElements = matFormFieldFlex.querySelectorAll(
                '.mat-form-field-outline, .mat-form-field-outline.mat-form-field-outline-thick'
            );
            const classestoRemove = ['info', 'warning', 'danger', 'disabled', 'success'];
            outlineElements.forEach((element) => {
                const classList = Array.from(element.classList);
                classList.forEach((className) => {
                    if (classestoRemove.includes(className)) {
                        this.renderer.removeClass(element, className);
                        this.renderer.removeClass(inputarea, className)
                        console.log("Removing classes: ", className)
                    }
                });
                this.renderer.setStyle(element, 'background-color', backgroundColor);
            });
        } else {
            console.log('mat-form-field-flex element not found');
        }
        this.cdRef.detectChanges();
    }

    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && typeof data.msg.payload !== 'undefined') {
            this.label = this.formatFromData(data, this.data.label);
            this.valueIn = this.formatFromData(data);
        }

        const inputarea = this.myInputarea.nativeElement;
        if (data.msg.payload.health == 'down') {
            // If health is 'down', add the 'health-down' class and remove background-color for input area
            let currentElement = inputarea;
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
                    '.mat-form-field-outline, .mat-form-field-outline.mat-form-field-outline-thick'
                );
                const classestoRemove = ['info', 'warning', 'danger', 'disabled', 'success'];
                outlineElements.forEach((element) => {
                    const classList = Array.from(element.classList);
                    classList.forEach((className) => {
                        if (classestoRemove.includes(className)) {
                            this.renderer.removeClass(element, className);
                            this.renderer.removeClass(inputarea, className)
                            console.log("Removing class for health-down: ", className)
                        }
                    });
                    this.renderer.removeStyle(inputarea, 'background-color', RendererStyleFlags2.Important);
                    this.renderer.removeStyle(inputarea, 'color');
                    this.renderer.removeStyle(element, 'background-color');
                    this.renderer.addClass(element, 'health-down');
                });
            }
        } else if (data.msg.payload['class']) {
            let currentElement = inputarea;
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
                    '.mat-form-field-outline, .mat-form-field-outline.mat-form-field-outline-thick'
                );
                const classestoRemove = ['info', 'warning', 'danger', 'disabled', 'success'];
                outlineElements.forEach((element) => {
                    const classList = Array.from(element.classList);
                    classList.forEach((className) => {
                        if (classestoRemove.includes(className)) {
                            this.renderer.removeClass(element, className);
                            this.renderer.removeClass(inputarea, className)
                            console.log("Replacing classes. Removed: ", className)
                        }
                    });
                    this.renderer.removeStyle(inputarea, 'background-color', RendererStyleFlags2.Important);
                    this.renderer.removeStyle(inputarea, 'color', RendererStyleFlags2.Important);
                    this.renderer.removeStyle(element, 'background-color');
                    this.renderer.removeClass(element, 'health-down');
                    this.renderer.addClass(element, data.msg.payload['class']);
                });
            }
        } else {
            this.applyStylesToTree();
        }
        this.styleService.setStyle(data);
        this.styleService.setClass(data);
    }

    keyup(value: string) {
        this.valueSubject.next(value);
    }

    change(value: string) {
        this.formatAndSend(this.data.topic, this.label, value);
        this.applyStylesToTree();
    }
    valueChange(field: string, value: any, fieldType: string) {
        if (fieldType === 'number' && !isNaN(value)) {
            value = parseFloat(value);
        }
        this.data.formValue[field] = value;

        // Apply styles after the value changes
        this.applyStylesToTree();
    }
}
