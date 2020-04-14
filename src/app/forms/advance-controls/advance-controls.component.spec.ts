import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceControlsComponent } from './advance-controls.component';

describe('AdvanceControlsComponent', () => {
  let component: AdvanceControlsComponent;
  let fixture: ComponentFixture<AdvanceControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdvanceControlsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvanceControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
