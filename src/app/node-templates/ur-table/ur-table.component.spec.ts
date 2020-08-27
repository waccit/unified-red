import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrTableComponent } from './ur-table.component';

describe('UrTableComponent', () => {
  let component: UrTableComponent;
  let fixture: ComponentFixture<UrTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
