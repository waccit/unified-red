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
@Component({
    selector: 'app-ur-form',
    templateUrl: './ur-form.component.html',
    styleUrls: ['./ur-form.component.sass'],
})
export class UrFormComponent extends BaseNode implements AfterViewInit {
    private originalValues = {};
    private formLabels = {};
    public dynamicStyles: { [key: string]: string } = {};

    // private specialTypes = ['multiline', 'select', 'checkbox', 'switch'];
    private specialTypes = ['multiline', 'select'];
    private excludeTypes = ['checkbox', 'switch'];

    @ViewChild('multilineElement') multilineElement!: ElementRef;
    @ViewChild('selectElement') selectElement!: ElementRef;
    @ViewChild('defaultElement') defaultElement!: ElementRef;

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
        this.cdRef.detectChanges();
        this.data.options.forEach((opt) => {
            this.formLabels[this.evalInstanceParameters(opt.topic)] = opt.label;
        });
        for (let field of this.data.options) {
            field.topic = this.evalInstanceParameters(field.topic);
        }
    }

    ngAfterContentCheck(): void {
        this.cdRef.detectChanges();
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
        this.updateStylesAndClasses(data);
    }

    updateStylesAndClasses(data: any) {
        const formType = this.data.options[0].type;
        if (this.excludeTypes.includes(formType)) {
            return;
        }
        const targetElement = this.specialTypes.includes(formType)
            ? this[`${formType}Element`].nativeElement
            : this.defaultElement.nativeElement;
        if (data.msg.payload.health === 'down') {
            this.styleService.applyHealthDown(targetElement, this.renderer, this.cdRef);
        } else if (data.msg.payload['class']) {
            this.styleService.applyClass(targetElement, data.msg.payload['class'], this.renderer, this.cdRef);
        } else {
            this.styleService.applyStyles(targetElement, data, this.renderer, this.cdRef);
        }

        if (data.msg.payload.health !== 'down') {
            this.styleService.setStyle(data);
        }
        this.styleService.setClass(data);
    }

    valueChange(field: string, value: any, fieldType: string) {
        if (fieldType === 'number' && !isNaN(value)) {
            value = parseFloat(value);
        }
        this.data.formValue[field] = value;
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
        this.styleService.resetStyles();
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
