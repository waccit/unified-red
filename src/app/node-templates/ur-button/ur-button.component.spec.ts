import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrButtonComponent } from './ur-button.component';

describe('UrButtonComponent', () => {
    let component: UrButtonComponent;
    let fixture: ComponentFixture<UrButtonComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UrButtonComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UrButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
