import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesTableComponent } from './roles-table.component';

describe('RolesTableComponent', () => {
    let component: RolesTableComponent;
    let fixture: ComponentFixture<RolesTableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RolesTableComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RolesTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
