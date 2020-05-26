import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactGridComponent } from './contact-grid.component';

describe('ContactGridComponent', () => {
  let component: ContactGridComponent;
  let fixture: ComponentFixture<ContactGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContactGridComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
