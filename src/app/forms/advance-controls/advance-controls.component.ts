import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface User {
    name: string;
}

@Component({
    selector: 'app-advance-controls',
    templateUrl: './advance-controls.component.html',
    styleUrls: ['./advance-controls.component.sass'],
})
export class AdvanceControlsComponent {
    hide = true;
    color: any;
    color1: any;
    color2: any;
    myControl = new FormControl();
    options: User[] = [{ name: 'Mary' }, { name: 'Shelley' }, { name: 'Igor' }];
    filteredOptions: Observable<User[]>;

    themeForm: FormGroup;
    colorControl = new FormControl('primary');
    fontSizeControl = new FormControl(16, Validators.min(10));

    constructor(fb: FormBuilder) {
        this.themeForm = fb.group({
            color: this.colorControl,
            fontSize: this.fontSizeControl,
        });
    }

    ngOnInit() {
        this.filteredOptions = this.myControl.valueChanges.pipe(
            startWith(''),
            map((value) => (typeof value === 'string' ? value : value.name)),
            map((name) => (name ? this._filter(name) : this.options.slice()))
        );
    }
    getFontSize() {
        return Math.max(10, this.fontSizeControl.value);
    }
    displayFn(user: User): string {
        return user && user.name ? user.name : '';
    }

    private _filter(name: string): User[] {
        const filterValue = name.toLowerCase();

        return this.options.filter(
            (option) => option.name.toLowerCase().indexOf(filterValue) === 0
        );
    }

    email = new FormControl('', [Validators.required, Validators.email]);

    getErrorMessage() {
        return this.email.hasError('required')
            ? 'You must enter a value'
            : this.email.hasError('email')
            ? 'Not a valid email'
            : '';
    }
}
