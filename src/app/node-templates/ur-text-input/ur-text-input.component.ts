import { Component, AfterViewInit, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { BaseNode } from '../ur-base-node';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { WebSocketService, SnackbarService, CurrentUserService, RoleService } from '../../services';
import { StyleService } from '../../services/style.service'; 

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

    @ViewChild('myInputarea') myInputarea!: ElementRef

    constructor(
        private renderer: Renderer2,
        private localStyleService: StyleService,
        websocketService: WebSocketService,
        snackbarService: SnackbarService,
        currentUserService: CurrentUserService,
        roleService: RoleService
    ) {
        super(websocketService, currentUserService, roleService, snackbarService, localStyleService);
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

    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && typeof data.msg.payload !== 'undefined') {
            this.label = this.formatFromData(data, this.data.label);
            this.valueIn = this.formatFromData(data);
        }
        //Applies styles after value updates
        this.applyStylesToTree()
    }

    keyup(value: string) {
        this.valueSubject.next(value);
    }

    change(value: string) {
        this.formatAndSend(this.data.topic, this.label, value);
    }

    applyStylesToTree() {
        // // Get the input element using ViewChild
        // const inputElement = this.myInputarea.nativeElement;
        // console.log('Input element:', inputElement);

        // // Get the styles of the input element
        // const styles = window.getComputedStyle(inputElement);
        // console.log('Input styles:', styles);

        //  // Attempt to get the background color from the inline styles
        //  let backgroundColor = inputElement.style.backgroundColor;
        //  console.log('Textarea inline background-color:', backgroundColor);

        // // Traverse up the tree to find the nearest div with the class "mat-form-field-flex"
        // let currentElement = inputElement;
        // let matFormFieldFlex: HTMLElement | null = null;
        // while (currentElement.parentElement) {
        //     currentElement = currentElement.parentElement;
        //     if (currentElement.classList.contains('mat-form-field-flex')) {
        //         matFormFieldFlex = currentElement;
        //         break;
        //     }
        // }
        // console.log('mat-form-field-flex element:', matFormFieldFlex);

        // if (matFormFieldFlex) {
        //     // Traverse down to find children with the specified classes
        //     const outlineElements = matFormFieldFlex.querySelectorAll('.mat-form-field-outline, .mat-form-field-outline.mat-form-field-outline-thick');
        //     outlineElements.forEach(element => {
        //         console.log('Child element with class mat-form-field-outline or mat-form-field-outline-thick:', element);
        //         // Testing applying styles. Just working on
        //         this.renderer.setStyle(element, 'background-color', backgroundColor);
        //     });
        // } else {
        //     console.log('mat-form-field-flex element not found');
        // }
    }
}
