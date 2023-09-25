import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrAlarmComponent } from './ur-alarm.component';

describe('UrAlarmComponent', () => {
  let component: UrAlarmComponent;
  let fixture: ComponentFixture<UrAlarmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrAlarmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrAlarmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
