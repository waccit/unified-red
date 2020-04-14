import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Dashboard3Component } from './dashboard3.component';

describe('Dashboard3Component', () => {
  let component: Dashboard3Component;
  let fixture: ComponentFixture<Dashboard3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Dashboard3Component]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Dashboard3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
