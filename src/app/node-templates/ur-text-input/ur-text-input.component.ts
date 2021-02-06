import { Component,AfterViewInit } from '@angular/core';
import { BaseNode } from '../ur-base-node';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
                    this.formatAndSend(this.data.topic, this.valueSubject.value);
                });
        }
    }

    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && typeof data.msg.payload !== 'undefined') {
            this.label = this.formatFromData(data, this.data.label);
            this.valueIn = this.formatFromData(data);
        }
    }

    keyup(value: string) {
        this.valueSubject.next(value);
    }

    change(value: string) {
        this.formatAndSend(this.data.topic, value);
    }
}
