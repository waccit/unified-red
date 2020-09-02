import { Component, EventEmitter, Output } from '@angular/core';
import { BaseNode } from '../ur-base-node';
import { Subject, fromEvent, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-ur-text-input',
    templateUrl: './ur-text-input.component.html',
    styleUrls: ['./ur-text-input.component.sass'],
})
export class UrTextInputComponent extends BaseNode {
    valueSubject = new BehaviorSubject('');
    delay: number;

    ngAfterViewInit(): void {
        super.ngAfterViewInit();

        this.delay = parseInt(this.data.delay);
        if (this.delay > 0) {
            this.valueSubject
                .asObservable()
                .pipe(debounceTime(this.delay), distinctUntilChanged())
                .subscribe(() => {
                    this.send({ payload: this.valueSubject.value });
                });
        }
    }

    updateValue(data: any) {
        super.updateValue(data);
        if (data && typeof data.value !== 'undefined') {
            this.valueSubject.next(data.value);
        }
    }

    keyup(value: string) {
        this.valueSubject.next(value);
    }
    
    change(value: string) {
        this.valueSubject.next(value);
        this.send({ payload: value });
    }
}
