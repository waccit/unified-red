import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuEntityComponent } from './menu-entity.component';

describe('MenuEntityComponent', () => {
  let component: MenuEntityComponent;
  let fixture: ComponentFixture<MenuEntityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuEntityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
