import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrAnimationComponent } from './ur-animation.component';

describe('UrAnimationComponent', () => {
    let component: UrAnimationComponent;
    let fixture: ComponentFixture<UrAnimationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UrAnimationComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UrAnimationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
