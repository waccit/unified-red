import {
    Component,
    AfterViewInit,
    ElementRef,
    Renderer2,
    ViewChild,
    ChangeDetectorRef,
    RendererStyleFlags2,
} from '@angular/core';
import { BaseNode } from '../ur-base-node';
import { WebSocketService, SnackbarService, CurrentUserService, RoleService } from '../../services';
import { StyleService } from '../../services/style.service';
import { reduce } from 'rxjs/operators';

@Component({
    selector: 'app-ur-form',
    templateUrl: './ur-form.component.html',
    styleUrls: ['./ur-form.component.sass'],
})
export class UrFormComponent extends BaseNode implements AfterViewInit {
    private originalValues = {};
    private formLabels = {};
    public dynamicStyles: { [key: string]: string } = {};

    @ViewChild('myTextarea') myTextarea!: ElementRef;

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
        this.data.options.forEach((opt) => {
            this.formLabels[this.evalInstanceParameters(opt.topic)] = opt.label;
        });
        for (let field of this.data.options) {
            field.topic = this.evalInstanceParameters(field.topic);
        }

        this.applyStylesToTree();
    }

    applyStylesToTree() {
        const textarea = this.myTextarea.nativeElement;
        const styles = this.styleService.getStyle(this.data);
        const color = styles?.['color'] || null;
        const backgroundColor = styles?.['background-color'] || null;

        // Traverse up the tree to find the nearest div with the class "mat-form-field-flex"
        let currentElement = textarea;
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
                            this.renderer.removeClass(textarea, className)
                            console.log("Removing class: ", className)
                        }
                    });
                const classes = element.classList;
                this.renderer.removeClass(element, 'health-down');
                this.renderer.removeClass(textarea, 'health-down');
                this.renderer.removeClass(element, classes[3]);
                this.renderer.setStyle(textarea, 'color', color);
                this.renderer.setStyle(element, 'background-color', backgroundColor);
            });
        } else {
            ('mat-form-field-flex element not found');
        }
    }
    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && data.msg.topic && typeof data.msg.payload !== 'undefined') {
            for (let field of this.data.options) {
                if (data.msg.topic.includes(field.topic)) {
                    field.intopic = data.msg.topic;
                    if (!field.options?.units && data.msg.payload.units) {
                        let options = field.options || {};
                        options.units = data.msg.payload.units;
                        field.options = options;
                    }
                    this.data.formValue[field.topic] = this.formatFromData(data);
                    this.originalValues[data.msg.topic] = data.msg.payload.value;
                    break;
                }
            }
        }
        const textarea = this.myTextarea.nativeElement;
        if (data.msg.payload.health == 'down') {
            // If health is 'down', directly add the 'health-down' class and remove background-color for textarea
            let currentElement = textarea;
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
                            this.renderer.removeClass(textarea, className)
                            console.log("Removing class for health-down: ", className)
                        }
                    });
                    this.renderer.removeStyle(textarea, 'background-color', RendererStyleFlags2.Important);
                    this.renderer.removeStyle(textarea, 'color');
                    this.renderer.removeStyle(element, 'background-color');
                    this.renderer.addClass(element, 'health-down');
                });
            }
        } else if (data.msg.payload['class']) {
            let currentElement = textarea;
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
                            this.renderer.removeClass(textarea, className)
                            console.log("Replacing classes. Removed: ", className)
                        }
                    });
                    this.renderer.removeStyle(textarea, 'background-color', RendererStyleFlags2.Important);
                    this.renderer.removeStyle(textarea, 'color');
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

    valueChange(field: string, value: any, fieldType: string) {
        if (fieldType === 'number' && !isNaN(value)) {
            value = parseFloat(value);
        }
        this.data.formValue[field] = value;

        this.applyStylesToTree();
    }

    submit() {
        if (this.data.singleMsg === 'true') {
            let combinedLabels = '';
            for (let label of Object.values(this.formLabels)) {
                combinedLabels += label + ', ';
            }
            combinedLabels = combinedLabels.slice(0, -2);

            let combinedPayload = {};
            for (const field of this.data.options) {
                combinedPayload[field.outtopic] = this.data.formValue[field.topic];
            }

            this.formatAndSend(this.data.singleMsgTopic, combinedLabels, combinedPayload);
            this.snackbar.success('Saved!');
        } else {
            for (const field of this.data.options) {
                const payload = this.data.formValue[field.topic];
                if (payload !== '') {
                    // send only if form element has a value
                    let topic = field.outtopic || field.intopic || field.topic;
                    let label: any = '';
                    for (let [t, l] of Object.entries(this.formLabels)) {
                        if (topic.includes(t)) {
                            label = l;
                        }
                    }
                    this.formatAndSend(topic, label, payload);
                }
            }
            this.snackbar.success('Saved!');
        }
    }

    reset() {
        this.data.formValue = { ...this.originalValues };
    }

    precision(value, precision) {
        try {
            if (value && !isNaN(value) && precision && !isNaN(precision)) {
                return parseFloat(value).toFixed(parseInt(precision, 10));
            }
        } catch (e) {}
        return value;
    }
}
