import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UrTemplateComponent } from './ur-template.component';

describe('UrTemplateComponent', () => {
    let component: UrTemplateComponent;
    let fixture: ComponentFixture<UrTemplateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UrTemplateComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UrTemplateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
