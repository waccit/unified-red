import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrTextInputComponent } from './ur-text-input.component';

describe('UrTextInputComponent', () => {
  let component: UrTextInputComponent;
  let fixture: ComponentFixture<UrTextInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrTextInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrTextInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
