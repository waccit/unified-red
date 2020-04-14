import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormExamplesComponent } from './form-examples.component';

describe('FormExamplesComponent', () => {
  let component: FormExamplesComponent;
  let fixture: ComponentFixture<FormExamplesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormExamplesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormExamplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
