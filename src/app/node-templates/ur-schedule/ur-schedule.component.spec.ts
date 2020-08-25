import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrScheduleComponent } from './ur-schedule.component';

describe('UrScheduleComponent', () => {
    let component: UrScheduleComponent;
    let fixture: ComponentFixture<UrScheduleComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UrScheduleComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UrScheduleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
