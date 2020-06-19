import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleFormDialogComponent } from './role-form-dialog.component';

describe('RoleFormDialogComponent', () => {
    let component: RoleFormDialogComponent;
    let fixture: ComponentFixture<RoleFormDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RoleFormDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RoleFormDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
