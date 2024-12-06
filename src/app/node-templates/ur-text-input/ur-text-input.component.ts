import {
    Component,
    AfterViewInit,
    ElementRef,
    Renderer2,
    ViewChild,
    RendererStyleFlags2,
    ChangeDetectorRef,
} from '@angular/core';
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
    }
    ngAfterContentCheck(): void {
        this.cdRef.detectChanges();
    }

    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && typeof data.msg.payload !== 'undefined') {
            this.label = this.formatFromData(data, this.data.label);
            this.valueIn = this.formatFromData(data);
        }

        const inputarea = this.myInputarea.nativeElement;
        if (data.msg.payload.health === 'down') {
            this.styleService.applyHealthDown(inputarea, this.renderer, this.cdRef);
        } else if (data.msg.payload['class']) {
            this.styleService.applyClass(inputarea, data.msg.payload['class'], this.renderer, this.cdRef);
        } else {
            this.styleService.applyStyles(inputarea, data, this.renderer, this.cdRef);
        }

        if (data.msg.payload.health !== 'down') {
            this.styleService.setStyle(data);
        }
        this.styleService.setClass(data);
    }

    keyup(value: string) {
        this.valueSubject.next(value);
    }

    change(value: string) {
        this.formatAndSend(this.data.topic, this.label, value);
    }
    valueChange(field: string, value: any, fieldType: string) {
        if (fieldType === 'number' && !isNaN(value)) {
            value = parseFloat(value);
        }
        this.data.formValue[field] = value;

        // Apply styles after the value changes
    }
}
