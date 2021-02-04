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
    valueSubject = new BehaviorSubject('');
    delay: number;

    ngAfterViewInit(): void {
        super.ngAfterViewInit();
        this.setupDatapointAccess();

        this.delay = parseInt(this.data.delay, 10);
        if (this.delay > 0) {
            this.valueSubject
                .asObservable()
                .pipe(debounceTime(this.delay), distinctUntilChanged())
                .subscribe(() => {
                    this.send();
                });
        }
    }

    updateValue(data: any) {
        super.updateValue(data);
        if (data && data.msg && typeof data.msg.payload !== 'undefined') {
            let value = this.format(data);
            this.valueSubject.next(value);
        }
    }

    keyup(value: string) {
        this.valueSubject.next(value);
    }

    change(value: string) {
        this.valueSubject.next(value);
        this.send();
    }

    setFormatValue(value) {
        let ret = {};
        const expression = /^\{\{([^\}]*)\}\}$/.exec(this.data.format);
        if (expression.length >= 2 && value) {
            let walk = ret;
            const parts = expression[1].split('.');
            for (let i = 0; i < parts.length; i++) {
                if (i === parts.length - 1) {
                    walk[ parts[i] ] = value;
                }
                else {
                    walk[ parts[i] ] = {};
                    walk = walk[ parts[i] ];
                }
            }
        }
        return ret;
    }

    send() {
        let data: any = this.setFormatValue(this.valueSubject.value);
        data.msg.topic = this.data.topic;
        super.send(data.msg);
    }
}
