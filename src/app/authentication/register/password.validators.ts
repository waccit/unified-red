/*
Credit to Jason Watmore (https://github.com/cornflourblue) for Angular Reactive Forms Validation example.
Source: https://jasonwatmore.com/post/2018/11/07/angular-7-reactive-forms-validation-example
*/

import { FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';

// custom validator to check that two fields match
export function MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];

        if (matchingControl.errors && !matchingControl.errors.mustMatch) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        // set error on matchingControl if validation fails
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ mustMatch: true });
        } else {
            matchingControl.setErrors(null);
        }
    };
}

export function PasswordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';
    if (!value) {
        return null;
    }
    if (!/[A-Z]+/g.test(value)) {
        return {
            passwordStrength: `Password must contain an uppercase character`,
        };
    }
    if (!/[a-z]+/g.test(value)) {
        return {
            passwordStrength: `Password must contain a lowercase character`,
        };
    }
    if (
        !/[0-9`~\!@#\$%\^&\*\(\)\-_\=\+\[\]\{\}\\/\|;:'\",\.\<\>\?]+/g.test(
            value
        )
    ) {
        return {
            passwordStrength: `Password must contain a number or a symbol`,
        };
    }
    return null;
};
