import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrFormComponent } from './ur-form.component';

describe('UrFormComponent', () => {
  let component: UrFormComponent;
  let fixture: ComponentFixture<UrFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
