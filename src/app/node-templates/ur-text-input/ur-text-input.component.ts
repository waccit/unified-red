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
            let value = this.formatFromData(data);
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

    send() {
        this.formatAndSend(this.data.topic, this.valueSubject.value);
    }
}
