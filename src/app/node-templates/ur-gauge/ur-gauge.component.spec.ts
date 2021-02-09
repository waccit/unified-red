import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrGaugeComponent } from './ur-gauge.component';

describe('UrGaugeComponent', () => {
  let component: UrGaugeComponent;
  let fixture: ComponentFixture<UrGaugeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrGaugeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrGaugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
