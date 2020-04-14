import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressbarsComponent } from './progressbars.component';

describe('ProgressbarsComponent', () => {
  let component: ProgressbarsComponent;
  let fixture: ComponentFixture<ProgressbarsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProgressbarsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressbarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
