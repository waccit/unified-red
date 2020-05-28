import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelperClassesComponent } from './helper-classes.component';

describe('HelperClassesComponent', () => {
    let component: HelperClassesComponent;
    let fixture: ComponentFixture<HelperClassesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HelperClassesComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HelperClassesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
