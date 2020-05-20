import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrTextComponent } from './ur-text.component';

describe('UrTextComponent', () => {
  let component: UrTextComponent;
  let fixture: ComponentFixture<UrTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UrTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UrTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
