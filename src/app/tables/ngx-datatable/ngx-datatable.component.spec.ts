import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxDatatableComponent } from './ngx-datatable.component';

describe('NgxDatatableComponent', () => {
    let component: NgxDatatableComponent;
    let fixture: ComponentFixture<NgxDatatableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NgxDatatableComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NgxDatatableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
