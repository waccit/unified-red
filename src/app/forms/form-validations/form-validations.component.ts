import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { CustomValidators } from 'ngx-custom-validators';

@Component({
  selector: 'app-form-validations',
  templateUrl: './form-validations.component.html',
  styleUrls: ['./form-validations.component.scss']
})
export class FormValidationsComponent {
  // Form 1
  register: FormGroup;
  hide = true;
  agree = false;
  customForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.register = this.fb.group({
      first: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      last: [''],
      password: ['', [Validators.required]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.minLength(5)]
      ],
      address: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['', [Validators.required]],
      termcondition: [false]
    });

    //  ngx-custom-validators
    let password = new FormControl('', Validators.required);
    let certainPassword = new FormControl(
      '',
      CustomValidators.equalTo(password)
    );
    let password1 = new FormControl('', Validators.required);
    let certainPassword1 = new FormControl(
      '',
      CustomValidators.notEqualTo(password1)
    );

    this.customForm = new FormGroup({
      fieldReq: new FormControl('', Validators.required),
      range: new FormControl('', CustomValidators.range([5, 9])),
      min: new FormControl('', CustomValidators.min(10)),
      max: new FormControl('', CustomValidators.max(10)),
      gt: new FormControl('', CustomValidators.gt(10)),
      lt: new FormControl('', CustomValidators.lt(10)),
      rangeLength: new FormControl('', CustomValidators.rangeLength([5, 9])),
      url: new FormControl('', CustomValidators.url),
      email: new FormControl('', CustomValidators.email),
      date: new FormControl('', CustomValidators.date),
      minDate: new FormControl('', CustomValidators.minDate('2016-09-09')),
      maxDate: new FormControl('', CustomValidators.maxDate('2020-09-09')),
      creditCard: new FormControl('', CustomValidators.creditCard),
      json: new FormControl('', CustomValidators.json),
      base64: new FormControl('', CustomValidators.base64),
      uuid: new FormControl('', CustomValidators.uuid('3')),
      equal: new FormControl('', CustomValidators.equal('abc')),
      notEqual: new FormControl('', CustomValidators.notEqual('abc')),
      password: password,
      certainPassword: certainPassword,
      password1: password1,
      certainPassword1: certainPassword1
    });
  }
  onRegister() {
    console.log('Form Value', this.register.value);
  }
}
