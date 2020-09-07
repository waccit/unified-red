import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmConsoleComponent } from './alarm-console.component';

describe('AlarmConsoleComponent', () => {
    let component: AlarmConsoleComponent;
    let fixture: ComponentFixture<AlarmConsoleComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AlarmConsoleComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AlarmConsoleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
