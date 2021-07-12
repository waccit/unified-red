import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrChartComponent } from './ur-chart.component';

describe('UrChartComponent', () => {
  let component: UrChartComponent;
  let fixture: ComponentFixture<UrChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
