import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrScheduleFormDialogComponent } from './ur-schedule-form-dialog.component';

describe('UrScheduleFormDialogComponent', () => {
    let component: UrScheduleFormDialogComponent;
    let fixture: ComponentFixture<UrScheduleFormDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UrScheduleFormDialogComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UrScheduleFormDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
