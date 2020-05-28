import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceTableComponent } from './advance-table.component';

describe('AdvanceTableComponent', () => {
    let component: AdvanceTableComponent;
    let fixture: ComponentFixture<AdvanceTableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AdvanceTableComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdvanceTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
