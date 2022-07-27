import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeREDRouterComponent } from './node-red-router.component';

describe('NodeREDRouterComponent', () => {
  let component: NodeREDRouterComponent;
  let fixture: ComponentFixture<NodeREDRouterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeREDRouterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeREDRouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
